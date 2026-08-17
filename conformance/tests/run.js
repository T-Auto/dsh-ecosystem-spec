const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..', '..');
const load = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const schemas = {
  plugin: load('schemas/dsh-plugin.schema.json'),
  host: load('schemas/host-descriptor.schema.json'),
  message: load('schemas/messages-observe-envelope.schema.json'),
  ledger: load('schemas/effect-ledger-record.schema.json'),
  claim: load('schemas/conformance-claim.schema.json')
};
const registry = load('registry/registry-0.15.json');
const permissionRegistry = load('registry/permissions-0.1.json');
// Registered facet API versions are authoritative in the registry (C-003):
// manifests may only request a registered facet apiVersion.
const facetApiVersions = registry.facetApiVersions ?? [];

// Contract index (v0.15 meta-protocol): coordinates are canonical,
// legacy flat names are kept as aliases (community v0.15 §3.2 mapping table).
const byCoordinate = new Map(registry.entries.map((e) => [`${e.coordinates.apiVersion}#${e.coordinates.kind}`, e]));
const byName = new Map(registry.entries.map((e) => [e.name, e]));
const groupOf = (apiVersion) => apiVersion.split('/')[0];

function resolveRef(rootSchema, ref) {
  if (!ref.startsWith('#/')) throw new Error(`external ref is not supported by the zero-dependency runner: ${ref}`);
  return ref.slice(2).split('/').reduce((v, key) => v[key.replace(/~1/g, '/').replace(/~0/g, '~')], rootSchema);
}

function check(value, schema, rootSchema, where = '$') {
  if (schema.$ref) return check(value, resolveRef(rootSchema, schema.$ref), rootSchema, where);
  // oneOf: exactly one variant must match (JSON Schema semantics). Variants are
  // currently mutually exclusive by design; exact-one keeps future overlap from
  // being silently accepted.
  if (schema.oneOf) {
    const matched = [];
    const errors = [];
    for (const variant of schema.oneOf) {
      try { check(value, variant, rootSchema, where); matched.push(variant); } catch (error) { errors.push(error.message); }
    }
    if (matched.length !== 1) throw new Error(`${where}: expected exactly one oneOf match, got ${matched.length}: ${errors.join(' | ')}`);
    return;
  }
  if (schema.const !== undefined && value !== schema.const) throw new Error(`${where}: expected ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) throw new Error(`${where}: value is not in enum`);
  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${where}: expected object`);
    for (const key of schema.required || []) if (!(key in value)) throw new Error(`${where}.${key}: required`);
    // draft-2020-12: additionalProperties only consults properties/patternProperties.
    if (schema.additionalProperties === false) for (const key of Object.keys(value)) if (!schema.properties?.[key]) throw new Error(`${where}.${key}: additional property`);
    for (const [key, child] of Object.entries(schema.properties || {})) if (key in value) check(value[key], child, rootSchema, `${where}.${key}`);
    if (schema.patternProperties) for (const [key, child] of Object.entries(schema.patternProperties)) for (const name of Object.keys(value)) if (new RegExp(key).test(name)) check(value[name], child, rootSchema, `${where}.${name}`);
  } else if (schema.type === 'array') {
    if (!Array.isArray(value)) throw new Error(`${where}: expected array`);
    if (schema.minItems !== undefined && value.length < schema.minItems) throw new Error(`${where}: too few items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) throw new Error(`${where}: too many items`);
    for (let i = 0; i < value.length; i++) check(value[i], schema.items, rootSchema, `${where}[${i}]`);
    if (schema.uniqueItems) { const encoded = value.map(JSON.stringify); if (new Set(encoded).size !== encoded.length) throw new Error(`${where}: duplicate items`); }
  } else if (schema.type === 'string') {
    if (typeof value !== 'string') throw new Error(`${where}: expected string`);
    if (schema.minLength !== undefined && value.length < schema.minLength) throw new Error(`${where}: too short`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) throw new Error(`${where}: too long`);
    if (schema.pattern && !(new RegExp(schema.pattern).test(value))) throw new Error(`${where}: pattern mismatch`);
    if (schema.format === 'uri' && !/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(value)) throw new Error(`${where}: invalid URI`);
    if (schema.format === 'date-time' && Number.isNaN(Date.parse(value))) throw new Error(`${where}: invalid date-time`);
  } else if (schema.type === 'integer') {
    if (!Number.isInteger(value)) throw new Error(`${where}: expected integer`);
    if (schema.minimum !== undefined && value < schema.minimum) throw new Error(`${where}: below minimum`);
  } else if (schema.type === 'boolean' && typeof value !== 'boolean') throw new Error(`${where}: expected boolean`);
}

function validate(name, value, schema, semanticCheck) {
  try {
    check(value, schema, schema);
    if (semanticCheck) semanticCheck(value);
    return {name, pass: true};
  } catch (error) { return {name, pass: false, error: error.message}; }
}

// Resolve a contract reference against the registry.
// Returns {entry, unregisteredVersion}. An unknown group or unknown kind in a
// known group is a manifest defect (INVALID_MANIFEST -> rejected). A known
// group+kind with an unregistered version is a VALID manifest that the
// negotiator answers with `unknown` (C-030 trigger (a)).
function resolveContractRef(ref) {
  const key = `${ref.apiVersion}#${ref.kind}`;
  const exact = byCoordinate.get(key);
  if (exact) return {entry: exact, unregisteredVersion: false};
  const sameGroup = registry.entries.filter((e) => groupOf(e.coordinates.apiVersion) === groupOf(ref.apiVersion));
  if (sameGroup.length === 0) throw new Error(`unknown contract group: ${groupOf(ref.apiVersion)}`);
  if (!sameGroup.some((e) => e.coordinates.kind === ref.kind)) throw new Error(`unknown contract kind: ${key}`);
  return {entry: null, unregisteredVersion: true};
}

// Resolve a subscription reference: canonical coordinate object, legacy
// flat-name string, or "apiVersion#kind" string.
function resolveSubscription(sub) {
  let entry;
  if (typeof sub === 'string') {
    entry = byName.get(sub) ?? byCoordinate.get(sub);
    if (!entry) throw new Error(`unknown subscription reference: ${sub}`);
  } else {
    entry = byCoordinate.get(`${sub.apiVersion}#${sub.kind}`);
    if (!entry) throw new Error(`unknown subscription coordinate: ${sub.apiVersion}#${sub.kind}`);
  }
  if (entry.kind !== 'event') throw new Error(`subscription must reference an event contract: ${sub.apiVersion ?? sub}`);
  return entry;
}

function validatePlugin(manifest) {
  // C-003: the requested facet host API version must be a registered value.
  if (!facetApiVersions.includes(manifest.facets.host.apiVersion)) throw new Error(`unregistered facet apiVersion: ${manifest.facets.host.apiVersion}`);
  const ids = manifest.contributes.commands.map((command) => command.id);
  if (new Set(ids).size !== ids.length) throw new Error('$.contributes.commands: duplicate command id');
  const resolved = new Set();
  for (const ref of manifest.requires.contracts) {
    // C-030: fallback is mandatory on every optional reference — including
    // references whose version is unregistered (no version exception).
    if (ref.optional === true && !ref.fallback) throw new Error(`optional contract without fallback: ${ref.apiVersion}#${ref.kind}`);
    const {unregisteredVersion} = resolveContractRef(ref);
    if (unregisteredVersion) continue; // valid manifest; negotiator answers `unknown`
    const key = `${ref.apiVersion}#${ref.kind}`;
    if (resolved.has(key)) throw new Error(`duplicate contract reference: ${key}`);
    resolved.add(key);
  }
  for (const sub of manifest.subscriptions) resolveSubscription(sub);
}

function validateHost(host) {
  // C-010: contracts must exist in the registry with a pinned schemaHash; a
  // coordinate may only appear once; declared permissions must be registered.
  const seen = new Set();
  const knownPermissions = new Set(permissionRegistry.permissions.map((p) => p.name));
  for (const contract of host.contracts) {
    const key = `${contract.apiVersion}#${contract.kind}`;
    if (seen.has(key)) throw new Error(`host declares duplicate contract: ${key}`);
    seen.add(key);
    const entry = byCoordinate.get(key);
    if (!entry) throw new Error(`host declares unknown contract: ${key}`);
    if (entry.schemaHash !== contract.schemaHash) throw new Error(`host schemaHash mismatch: ${key}`);
    for (const permission of contract.permissions) {
      if (!knownPermissions.has(permission)) throw new Error(`host declares unknown permission: ${permission}`);
    }
  }
}

function digestFile(relativePath) {
  return `sha256:${crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex')}`;
}

function verifyRegistry() {
  for (const entry of registry.entries) assert.equal(digestFile(entry.schema), entry.schemaHash, `${entry.name} schemaHash drifted`);
}

function negotiate(manifest, host, grants = []) {
  const supported = new Map(host.contracts.map((c) => [`${c.apiVersion}#${c.kind}`, c]));
  const required = manifest.requires.contracts.filter((r) => !r.optional);
  const optional = manifest.requires.contracts.filter((r) => r.optional);
  // `unknown` outranks every other outcome (C-030 priority): a referenced
  // version outside the registry cannot be judged — answering rejected here
  // would pretend we KNOW it is incompatible.
  const unjudgable = manifest.requires.contracts.filter((r) => {
    try { return resolveContractRef(r).unregisteredVersion; } catch { return false; }
  });
  if (unjudgable.length) return {decision: 'unknown', reasonCode: 'UNKNOWN_CONTRACT', unknownContracts: unjudgable.map((x) => `${x.apiVersion}#${x.kind}`)};
  // C-010/C-003: the manifest's facet host API version must be within the
  // host's declared facet API surface — otherwise the requested Host API
  // range is unavailable (fail closed).
  if (!host.facetApiVersions.includes(manifest.facets.host.apiVersion)) {
    return {decision: 'rejected', reasonCode: 'FACET_API_VERSION_UNAVAILABLE', facetApiVersion: manifest.facets.host.apiVersion, hostFacetApiVersions: host.facetApiVersions};
  }
  const available = (r) => {
    const hostContract = supported.get(`${r.apiVersion}#${r.kind}`);
    const reg = byCoordinate.get(`${r.apiVersion}#${r.kind}`);
    return Boolean(hostContract && reg && hostContract.schemaHash === reg.schemaHash);
  };
  const missingRequired = required.filter((r) => !available(r));
  const missingOptional = optional.filter((r) => !available(r));
  const hostPermissions = new Set(host.contracts.flatMap((c) => c.permissions));
  const granted = new Set(grants);
  const deniedPermissions = manifest.permissions.filter((permission) => {
    if (!hostPermissions.has(permission.name)) return true;
    const definition = permissionRegistry.permissions.find((item) => item.name === permission.name);
    return !definition || (definition.default === 'deny' && !granted.has(permission.name));
  });
  if (missingRequired.length) return {decision: 'rejected', reasonCode: 'REQUIRED_CONTRACT_UNAVAILABLE', missingRequired: missingRequired.map((x) => `${x.apiVersion}#${x.kind}`)};
  if (deniedPermissions.length) return {decision: 'waiting_authorization', reasonCode: 'PERMISSION_NOT_GRANTED', deniedPermissions: deniedPermissions.map((x) => x.name)};
  return {decision: missingOptional.length ? 'compatible_degraded' : 'compatible', missingOptional: missingOptional.map((x) => `${x.apiVersion}#${x.kind}`)};
}

verifyRegistry();

// C-040: every contract profile must answer the SPEC-WRITING-RULES §5
// ten-point capability boundary, plus the v0.15 coordinate identity and
// permission parity with its registry entry.
function verifyContractProfiles() {
  const REQUIRED_KEYS = ['name', 'version', 'kind', 'coordinates', 'caller', 'permissions', 'errors', 'concurrency', 'timeout', 'cleanup', 'privacyClass', 'securityBoundary'];
  for (const entry of registry.entries) {
    const profile = load(entry.schema);
    for (const key of REQUIRED_KEYS) assert.ok(key in profile, `${entry.name}: contract profile missing "${key}" (SPEC-WRITING-RULES §5)`);
    assert.equal(profile.coordinates.apiVersion, entry.coordinates.apiVersion, `${entry.name}: profile/registry apiVersion mismatch`);
    assert.equal(profile.coordinates.kind, entry.coordinates.kind, `${entry.name}: profile/registry kind mismatch`);
    assert.deepEqual([...profile.permissions].sort(), [...entry.permissions].sort(), `${entry.name}: profile/registry permissions mismatch`);
    if (entry.kind === 'capability') {
      assert.ok('operations' in profile || ('input' in profile && 'output' in profile), `${entry.name}: capability profile missing an input/output surface`);
    }
    if (entry.kind === 'event') assert.ok('envelope' in profile, `${entry.name}: event profile missing envelope`);
    assert.equal(profile.securityBoundary, false, `${entry.name}: trusted-in-process v0.15 must declare securityBoundary:false`);
  }
}
verifyContractProfiles();

const cases = [
  validate('valid plugin', load('conformance/fixtures/valid-plugin.json'), schemas.plugin, validatePlugin),
  validate('valid plugin coordinate subscriptions', load('conformance/fixtures/valid-plugin-object-subs.json'), schemas.plugin, validatePlugin),
  validate('invalid service rejected', load('conformance/fixtures/invalid-plugin-unknown-service.json'), schemas.plugin, validatePlugin),
  validate('duplicate command rejected', load('conformance/fixtures/invalid-plugin-duplicate-command.json'), schemas.plugin, validatePlugin),
  validate('unknown coordinate rejected', load('conformance/fixtures/invalid-plugin-unknown-coordinate.json'), schemas.plugin, validatePlugin),
  validate('unknown kind in known group rejected', load('conformance/fixtures/invalid-plugin-unknown-kind.json'), schemas.plugin, validatePlugin),
  validate('subscription to capability rejected', load('conformance/fixtures/invalid-plugin-subscription-capability.json'), schemas.plugin, validatePlugin),
  validate('duplicate coordinate ref rejected', load('conformance/fixtures/invalid-plugin-duplicate-coordinate.json'), schemas.plugin, validatePlugin),
  validate('unregistered facet apiVersion rejected', load('conformance/fixtures/invalid-plugin-facet-version.json'), schemas.plugin, validatePlugin),
  validate('client facet rejected', load('conformance/fixtures/invalid-plugin-client-facet.json'), schemas.plugin, validatePlugin),
  validate('worker facet rejected', load('conformance/fixtures/invalid-plugin-worker-facet.json'), schemas.plugin, validatePlugin),
  validate('valid message', load('conformance/fixtures/valid-message.json'), schemas.message),
  validate('invalid privacy rejected', load('conformance/fixtures/invalid-message-privacy.json'), schemas.message),
  validate('invalid content block rejected', load('conformance/fixtures/invalid-message-content.json'), schemas.message),
  validate('mixed content block rejected', load('conformance/fixtures/invalid-message-mixed-content.json'), schemas.message),
  validate('valid ledger', load('conformance/fixtures/valid-ledger-record.json'), schemas.ledger),
  validate('valid claim', load('conformance/fixtures/valid-claim.json'), schemas.claim),
  validate('valid host descriptor', load('registry/host-descriptor.tui.example.json'), schemas.host, validateHost),
  validate('host unknown contract rejected', load('conformance/fixtures/invalid-host-unknown-contract.json'), schemas.host, validateHost),
  validate('host hash mismatch rejected', load('conformance/fixtures/invalid-host-hash-mismatch.json'), schemas.host, validateHost),
  validate('host unknown permission rejected', load('conformance/fixtures/invalid-host-unknown-permission.json'), schemas.host, validateHost),
  validate('host duplicate contract rejected', load('conformance/fixtures/invalid-host-duplicate-contract.json'), schemas.host, validateHost),
  // C-030: an optional reference without a fallback is an invalid manifest —
  // including optional references with an unregistered version (F3 red-team fix).
  validate('optional without fallback rejected', load('conformance/fixtures/invalid-plugin-optional-no-fallback.json'), schemas.plugin, validatePlugin),
  // C-002: `provides` is rejected outright in v0.15 (services live in RFC 0003).
  validate('provides rejected', load('conformance/fixtures/invalid-plugin-provides.json'), schemas.plugin, validatePlugin),
  // C-030: a known group+kind with an unregistered version is a VALID manifest —
  // the negotiator, not the validator, answers it with `unknown`.
  validate('unregistered version is a valid manifest', load('conformance/fixtures/unknown-version-plugin.json'), schemas.plugin, validatePlugin),
  validate('compound unknown+rejected manifest is valid', load('conformance/fixtures/plugin-compound-unknown.json'), schemas.plugin, validatePlugin)
];
const expectCase = (name, expected) => {
  const found = cases.find((c) => c.name === name);
  assert.ok(found, `case not found: ${name}`);
  assert.equal(found.pass, expected, `${name}: ${found.error ?? `expected pass=${expected}`}`);
};
expectCase('valid plugin', true);
expectCase('valid plugin coordinate subscriptions', true);
expectCase('invalid service rejected', false);
expectCase('duplicate command rejected', false);
expectCase('unknown coordinate rejected', false);
expectCase('unknown kind in known group rejected', false);
expectCase('subscription to capability rejected', false);
expectCase('duplicate coordinate ref rejected', false);
expectCase('unregistered facet apiVersion rejected', false);
expectCase('client facet rejected', false);
expectCase('worker facet rejected', false);
expectCase('valid message', true);
expectCase('invalid privacy rejected', false);
expectCase('invalid content block rejected', false);
expectCase('mixed content block rejected', false);
expectCase('valid ledger', true);
expectCase('valid claim', true);
expectCase('valid host descriptor', true);
expectCase('host unknown contract rejected', false);
expectCase('host hash mismatch rejected', false);
expectCase('host unknown permission rejected', false);
expectCase('host duplicate contract rejected', false);
expectCase('optional without fallback rejected', false);
expectCase('provides rejected', false);
expectCase('unregistered version is a valid manifest', true);
expectCase('compound unknown+rejected manifest is valid', true);
const hostTui = load('registry/host-descriptor.tui.example.json');
const hostNoObserve = load('conformance/fixtures/host-no-observe.example.json');
const compatible = negotiate(load('conformance/fixtures/valid-plugin.json'), hostTui);
assert.equal(compatible.decision, 'compatible');
const waiting = negotiate(load('conformance/fixtures/waiting-authorization-plugin.json'), hostTui);
assert.equal(waiting.decision, 'waiting_authorization');
const authorized = negotiate(load('conformance/fixtures/waiting-authorization-plugin.json'), hostTui, ['messages.observe.read']);
assert.equal(authorized.decision, 'compatible');
// C-030: required contract missing on the host → rejected (before permission checks).
const rejected = negotiate(load('conformance/fixtures/waiting-authorization-plugin.json'), hostNoObserve);
assert.equal(rejected.decision, 'rejected');
assert.deepEqual(rejected.missingRequired, ['messages.dsh/v1alpha1#MessageObserver']);
// C-030: optional missing + declared fallback → compatible_degraded.
const degraded = negotiate(load('conformance/fixtures/valid-plugin.json'), hostNoObserve);
assert.equal(degraded.decision, 'compatible_degraded');
assert.deepEqual(degraded.missingOptional, ['messages.dsh/v1alpha1#MessageObserver']);
// C-030: a referenced version outside the registry → unknown (not rejected).
const unknown = negotiate(load('conformance/fixtures/unknown-version-plugin.json'), hostTui);
assert.equal(unknown.decision, 'unknown');
assert.equal(unknown.reasonCode, 'UNKNOWN_CONTRACT');
// C-030 priority: unregistered version + missing required → unknown outranks rejected.
const compoundUnknown = negotiate(load('conformance/fixtures/plugin-compound-unknown.json'), hostNoObserve);
assert.equal(compoundUnknown.decision, 'unknown');
// C-010/C-003: manifest facet apiVersion outside host facet surface → rejected.
const facetMismatch = negotiate(load('conformance/fixtures/valid-plugin.json'), load('conformance/fixtures/invalid-host-facet-version.json'));
assert.equal(facetMismatch.decision, 'rejected');
assert.equal(facetMismatch.reasonCode, 'FACET_API_VERSION_UNAVAILABLE');
console.log(JSON.stringify({suite: 'community-v0.15', cases, negotiation: {compatible, waiting, authorized, rejected, degraded, unknown, compoundUnknown, facetMismatch}}, null, 2));
