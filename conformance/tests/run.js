import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ProtocolCatalog,
  defineProtocolDeclaration,
} from './std-modules.js'
import {
  ManifestDefinitionCatalog,
  parseManifest,
  projectManifest,
} from './std-modules.js'
import { registerCommand, registerStorage } from './std-modules.js'
import {
  registerMessages,
  validateMessageEvent,
} from './std-modules.js'
import {
  facetModuleActivationDefinition,
  registerPresentation,
  registerWorkspace,
} from './std-modules.js'
import { registerProfileProtocols, registerTuiContributionExtensions } from '../../protocols/profile-definitions.js'
import {
  validateTuiChannelInput,
  validateTuiChannelRequirement,
  validateTuiChannelSnapshot,
  validateTuiChannelSupport,
} from '../../protocols/tui-channel.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const load = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'))
const source = relative => fs.readFileSync(path.join(root, relative), 'utf8')
const schemas = {
  host: load('schemas/host-descriptor.schema.json'),
  ledger: load('schemas/effect-ledger-record.schema.json'),
  claim: load('schemas/conformance-claim.schema.json'),
}
const profile = load('registry/registry-0.15.json')
const permissionRegistry = load('registry/permissions-0.1.json')
const facetApiVersions = profile.facetApiVersions ?? []
const profileEntries = [...profile.imports, ...profile.definitions]
const coordinateKey = value => `${value.apiVersion ?? value.coordinates.apiVersion}#${value.kind ?? value.coordinates.kind}`
const familyKey = value => `${(value.apiVersion ?? value.coordinates.apiVersion).split('/')[0]}#${value.kind ?? value.coordinates.kind}`
const byCoordinate = new Map(profileEntries.map(entry => [coordinateKey(entry.coordinates), entry]))
const byFamily = new Map(profileEntries.map(entry => [familyKey(entry.coordinates), entry]))
const byName = new Map(profileEntries.filter(entry => entry.name !== undefined).map(entry => [entry.name, entry]))

const protocols = new ProtocolCatalog({ name: 'dsh-tui-admission', version: '0.15' })
const manifestDefinitions = new ManifestDefinitionCatalog({ name: 'dsh-tui-admission', version: '0.15' })
manifestDefinitions.registerActivation(facetModuleActivationDefinition)
registerCommand(protocols, manifestDefinitions)
registerStorage(protocols)
registerMessages(protocols)
registerPresentation(protocols)
registerWorkspace(protocols, manifestDefinitions)
registerProfileProtocols(protocols)
registerTuiContributionExtensions(manifestDefinitions)

function resolveRef(rootSchema, ref) {
  if (!ref.startsWith('#/')) throw new Error(`external ref is not supported by the profile runner: ${ref}`)
  return ref.slice(2).split('/').reduce((value, key) => value[key.replace(/~1/g, '/').replace(/~0/g, '~')], rootSchema)
}

function check(value, schema, rootSchema, where = '$') {
  if (schema.$ref) return check(value, resolveRef(rootSchema, schema.$ref), rootSchema, where)
  if (schema.oneOf) {
    let matches = 0
    const errors = []
    for (const variant of schema.oneOf) {
      try { check(value, variant, rootSchema, where); matches += 1 } catch (error) { errors.push(error.message) }
    }
    if (matches !== 1) throw new Error(`${where}: expected exactly one oneOf match, got ${matches}: ${errors.join(' | ')}`)
    return
  }
  if (schema.const !== undefined && value !== schema.const) throw new Error(`${where}: expected ${JSON.stringify(schema.const)}`)
  if (schema.enum && !schema.enum.includes(value)) throw new Error(`${where}: value is not in enum`)
  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${where}: expected object`)
    for (const key of schema.required ?? []) if (!(key in value)) throw new Error(`${where}.${key}: required`)
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        const declared = Object.hasOwn(schema.properties ?? {}, key)
        const patterned = Object.keys(schema.patternProperties ?? {}).some(pattern => new RegExp(pattern).test(key))
        if (!declared && !patterned) throw new Error(`${where}.${key}: additional property`)
      }
    }
    for (const [key, child] of Object.entries(schema.properties ?? {})) if (key in value) check(value[key], child, rootSchema, `${where}.${key}`)
    for (const [pattern, child] of Object.entries(schema.patternProperties ?? {})) {
      for (const key of Object.keys(value)) if (new RegExp(pattern).test(key)) check(value[key], child, rootSchema, `${where}.${key}`)
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(value)) throw new Error(`${where}: expected array`)
    if (schema.minItems !== undefined && value.length < schema.minItems) throw new Error(`${where}: too few items`)
    if (schema.maxItems !== undefined && value.length > schema.maxItems) throw new Error(`${where}: too many items`)
    for (const [index, item] of value.entries()) check(item, schema.items, rootSchema, `${where}[${index}]`)
    if (schema.uniqueItems) {
      const encoded = value.map(item => JSON.stringify(item))
      if (new Set(encoded).size !== encoded.length) throw new Error(`${where}: duplicate items`)
    }
  } else if (schema.type === 'string') {
    if (typeof value !== 'string') throw new Error(`${where}: expected string`)
    if (schema.minLength !== undefined && value.length < schema.minLength) throw new Error(`${where}: too short`)
    if (schema.maxLength !== undefined && value.length > schema.maxLength) throw new Error(`${where}: too long`)
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) throw new Error(`${where}: pattern mismatch`)
    if (schema.format === 'uri') { try { new URL(value) } catch { throw new Error(`${where}: invalid URI`) } }
    if (schema.format === 'date-time' && Number.isNaN(Date.parse(value))) throw new Error(`${where}: invalid date-time`)
  } else if (schema.type === 'integer') {
    if (!Number.isInteger(value)) throw new Error(`${where}: expected integer`)
    if (schema.minimum !== undefined && value < schema.minimum) throw new Error(`${where}: below minimum`)
  } else if (schema.type === 'boolean' && typeof value !== 'boolean') throw new Error(`${where}: expected boolean`)
}

function validate(name, body, schema, semanticCheck) {
  try {
    if (schema !== undefined) check(body, schema, schema)
    semanticCheck?.(body)
    return { name, pass: true }
  } catch (error) {
    return { name, pass: false, error: error instanceof Error ? error.message : String(error) }
  }
}

function resolveProfileReference(reference) {
  const exact = byCoordinate.get(coordinateKey(reference))
  if (exact !== undefined) return { entry: exact, unknownVersion: false }
  const family = byFamily.get(familyKey(reference))
  if (family !== undefined) return { entry: family, unknownVersion: true }
  throw new Error(`protocol definition is not admitted by this profile: ${coordinateKey(reference)}`)
}

function resolveSubscription(subscription) {
  const entry = typeof subscription === 'string'
    ? byName.get(subscription)
    : byCoordinate.get(coordinateKey(subscription))
  if (entry === undefined) throw new Error(`unknown subscription: ${typeof subscription === 'string' ? subscription : coordinateKey(subscription)}`)
  if (entry.kind !== 'event') throw new Error(`subscription must reference an event: ${entry.name ?? coordinateKey(entry.coordinates)}`)
  return entry
}

function parseAndValidateManifest(relative) {
  const parsed = parseManifest(source(relative), { source: relative })
  if (!facetApiVersions.includes(parsed.facets.host.apiVersion)) {
    throw new Error(`facet apiVersion is not admitted: ${parsed.facets.host.apiVersion}`)
  }
  for (const requirement of parsed.requires.contracts) {
    resolveProfileReference(requirement)
    if (requirement.optional === true && !requirement.fallback) {
      throw new Error(`optional protocol requires a TUI fallback: ${coordinateKey(requirement)}`)
    }
  }
  for (const subscription of parsed.subscriptions) resolveSubscription(subscription)
  const projected = projectManifest(parsed)
  const report = manifestDefinitions.validate(projected, protocols, { source: relative })
  const errors = report.issues.filter(issue => issue.severity === 'error')
  if (errors.length > 0) throw new Error(errors.map(issue => issue.message).join('; '))
  return { parsed, projected }
}

function validateHost(host) {
  const seen = new Set()
  const knownPermissions = new Set(permissionRegistry.permissions.map(permission => permission.name))
  for (const contract of host.contracts) {
    const key = coordinateKey(contract)
    if (seen.has(key)) throw new Error(`host declares duplicate protocol: ${key}`)
    seen.add(key)
    const entry = byCoordinate.get(key)
    if (entry === undefined || !protocols.understands(contract)) throw new Error(`host declares an unknown protocol: ${key}`)
    if (contract.definition.source === 'dsh-std') {
      if (entry.package !== contract.definition.package) throw new Error(`host std definition source mismatch: ${key}`)
    } else if (entry.profileHash !== contract.definition.profileHash) {
      throw new Error(`host profile definition hash mismatch: ${key}`)
    }
    for (const permission of contract.permissions) {
      if (!knownPermissions.has(permission)) throw new Error(`host declares unknown permission: ${permission}`)
    }
  }
}

function digestFile(relative) {
  return `sha256:${crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex')}`
}

function verifyProfileDefinitions() {
  assert.equal(profile.std.submodule, 'vendor/dsh-std')
  assert.equal(profile.std.manifestVersion, '0.15')
  assert.equal(fs.existsSync(path.join(root, 'schemas/dsh-plugin.schema.json')), false, 'manifest schema must come from dsh-std')
  assert.equal(fs.existsSync(path.join(root, 'registry/contracts/commands-0.15.json')), false, 'Command must come from @dsh-std/command')
  assert.equal(fs.existsSync(path.join(root, 'registry/contracts/storage.local-0.15.json')), false, 'LocalStorage must come from @dsh-std/storage')
  assert.equal(fs.existsSync(path.join(root, 'registry/contracts/messages.observe-0.15.json')), false, 'MessageObserver must come from @dsh-std/messages')
  assert.equal(fs.existsSync(path.join(root, 'schemas/messages-observe-envelope.schema.json')), false, 'MessageObserver schema must come from @dsh-std/messages')
  assert.equal(fs.existsSync(path.join(root, 'registry/contracts/workspace-provider-v1alpha1.json')), true, 'legacy WorkspaceProvider reference path must remain available')
  for (const entry of profile.definitions) {
    assert.equal(digestFile(entry.profile), entry.profileHash, `${entry.name}: profile hash drifted`)
    assert.equal(protocols.understands(entry.coordinates), true, `${entry.name}: no dsh-std ProtocolDefinition is registered`)
    const contract = load(entry.profile)
    for (const key of ['name', 'version', 'kind', 'coordinates', 'caller', 'permissions', 'errors', 'concurrency', 'timeout', 'cleanup', 'privacyClass', 'securityBoundary']) {
      assert.ok(key in contract, `${entry.name}: profile missing ${key}`)
    }
    assert.deepEqual(contract.coordinates, entry.coordinates, `${entry.name}: profile coordinates differ`)
    assert.deepEqual([...contract.permissions].sort(), [...entry.permissions].sort(), `${entry.name}: permissions differ`)
    assert.equal(entry.authority, 'dsh-tui', `${entry.name}: local definition must belong to dsh-TUI`)
    assert.match(entry.coordinates.apiVersion, /^tui\.dsh\//u, `${entry.name}: private definition must use the TUI namespace`)
  }
  for (const entry of profile.extensions ?? []) {
    if (entry.authority === 'dsh-std') {
      assert.notEqual(manifestDefinitions.extension(entry.coordinates), undefined, `${entry.name}: imported manifest extension definition is unavailable`)
      continue
    }
    assert.equal(digestFile(entry.profile), entry.profileHash, `${entry.name}: profile hash drifted`)
    assert.notEqual(manifestDefinitions.extension(entry.coordinates), undefined, `${entry.name}: no manifest extension definition is registered`)
    const contract = load(entry.profile)
    for (const key of ['name', 'version', 'kind', 'coordinates', 'caller', 'permissions', 'errors', 'concurrency', 'timeout', 'cleanup', 'privacyClass', 'securityBoundary']) {
      assert.ok(key in contract, `${entry.name}: profile missing ${key}`)
    }
    assert.equal(contract.kind, 'extension', `${entry.name}: contract kind must be extension`)
    assert.deepEqual(contract.coordinates, entry.coordinates, `${entry.name}: profile coordinates differ`)
    assert.deepEqual([...contract.permissions].sort(), [...entry.permissions].sort(), `${entry.name}: permissions differ`)
    assert.equal(entry.authority, 'dsh-tui', `${entry.name}: local extension must belong to dsh-TUI`)
  }
  for (const entry of profile.imports) {
    assert.equal(protocols.understands(entry.coordinates), true, `${entry.package}: imported dsh-std definition is unavailable`)
  }
}

function admissionDecision(relative, host, grants = []) {
  const raw = load(relative)
  let parsed
  try { parsed = parseManifest(JSON.stringify(raw), { source: relative }) } catch (error) {
    return { decision: 'rejected', reasonCode: 'INVALID_MANIFEST', message: error.message }
  }
  const unknown = parsed.requires.contracts.filter(requirement => {
    try { return resolveProfileReference(requirement).unknownVersion } catch { return false }
  })
  if (unknown.length > 0) return {
    decision: 'unknown', reasonCode: 'UNKNOWN_PROTOCOL_VERSION',
    unknownContracts: unknown.map(coordinateKey),
  }
  if (!host.facetApiVersions.includes(parsed.facets.host.apiVersion)) return {
    decision: 'rejected', reasonCode: 'FACET_API_VERSION_UNAVAILABLE',
    facetApiVersion: parsed.facets.host.apiVersion,
  }
  const projected = projectManifest(parsed)
  const facet = projected.spec.facets[0]
  const supportKeys = new Set(host.contracts.map(coordinateKey))
  const requirements = facet.protocols?.requires ?? []
  const missingRequired = requirements.filter(row => row.optional !== true && !supportKeys.has(coordinateKey(row)))
  const missingOptional = requirements.filter(row => row.optional === true && !supportKeys.has(coordinateKey(row)))
  if (missingRequired.length > 0) return {
    decision: 'rejected', reasonCode: 'REQUIRED_PROTOCOL_UNAVAILABLE',
    missingRequired: missingRequired.map(coordinateKey),
  }
  const declaration = defineProtocolDeclaration({ participant: { id: parsed.id }, requires: requirements })
  const hostDeclaration = defineProtocolDeclaration({
    participant: { id: host.hostId },
    supports: host.contracts.map(contract => ({
      apiVersion: contract.apiVersion,
      kind: contract.kind,
      ...(contract.spec === undefined ? {} : { spec: contract.spec }),
    })),
  })
  const report = protocols.negotiate([declaration, hostDeclaration])
  if (!report.compatible && missingOptional.length === 0) return {
    decision: 'rejected', reasonCode: 'PROTOCOL_NEGOTIATION_FAILED', issues: report.issues,
  }
  const hostPermissions = new Set(host.contracts.flatMap(contract => contract.permissions))
  const granted = new Set(grants)
  const deniedPermissions = parsed.permissions.filter(request => {
    if (!hostPermissions.has(request.name)) return true
    const definition = permissionRegistry.permissions.find(permission => permission.name === request.name)
    return definition === undefined || (definition.default === 'deny' && !granted.has(request.name))
  })
  if (deniedPermissions.length > 0) return {
    decision: 'waiting_authorization', reasonCode: 'PERMISSION_NOT_GRANTED',
    deniedPermissions: deniedPermissions.map(request => request.name),
  }
  return {
    decision: missingOptional.length > 0 ? 'compatible_degraded' : 'compatible',
    missingOptional: missingOptional.map(coordinateKey),
  }
}

verifyProfileDefinitions()

const manifestCases = [
  ['valid plugin', 'conformance/fixtures/valid-plugin.json', true],
  ['valid TUI contributions', 'conformance/fixtures/valid-tui-contributions.json', true],
  ['valid plugin coordinate subscriptions', 'conformance/fixtures/valid-plugin-object-subs.json', true],
  ['valid private protocol plugin', 'conformance/fixtures/valid-private-protocol-plugin.json', true],
  ['invalid service rejected', 'conformance/fixtures/invalid-plugin-unknown-service.json', false],
  ['duplicate command rejected', 'conformance/fixtures/invalid-plugin-duplicate-command.json', false],
  ['unknown coordinate rejected', 'conformance/fixtures/invalid-plugin-unknown-coordinate.json', false],
  ['unknown kind rejected', 'conformance/fixtures/invalid-plugin-unknown-kind.json', false],
  ['subscription to capability rejected', 'conformance/fixtures/invalid-plugin-subscription-capability.json', false],
  ['duplicate coordinate rejected', 'conformance/fixtures/invalid-plugin-duplicate-coordinate.json', false],
  ['facet apiVersion rejected', 'conformance/fixtures/invalid-plugin-facet-version.json', false],
  ['client facet rejected', 'conformance/fixtures/invalid-plugin-client-facet.json', false],
  ['worker facet rejected', 'conformance/fixtures/invalid-plugin-worker-facet.json', false],
  ['optional without fallback rejected', 'conformance/fixtures/invalid-plugin-optional-no-fallback.json', false],
  ['provides rejected', 'conformance/fixtures/invalid-plugin-provides.json', false],
  ['unknown version remains structurally valid', 'conformance/fixtures/unknown-version-plugin.json', true],
  ['compound unknown remains structurally valid', 'conformance/fixtures/plugin-compound-unknown.json', true],
]
const cases = manifestCases.map(([name, relative, expected]) => {
  const result = validate(name, undefined, undefined, () => parseAndValidateManifest(relative))
  assert.equal(result.pass, expected, `${name}: ${result.error ?? `expected pass=${expected}`}`)
  return result
})
for (const [name, relative, schema, semanticCheck, expected] of [
  ['valid message', 'conformance/fixtures/valid-message.json', undefined, validateMessageEvent, true],
  ['invalid privacy rejected', 'conformance/fixtures/invalid-message-privacy.json', undefined, validateMessageEvent, false],
  ['invalid content rejected', 'conformance/fixtures/invalid-message-content.json', undefined, validateMessageEvent, false],
  ['mixed content rejected', 'conformance/fixtures/invalid-message-mixed-content.json', undefined, validateMessageEvent, false],
  ['valid ledger', 'conformance/fixtures/valid-ledger-record.json', schemas.ledger, undefined, true],
  ['valid claim', 'conformance/fixtures/valid-claim.json', schemas.claim, undefined, true],
]) {
  const result = validate(name, load(relative), schema, semanticCheck)
  assert.equal(result.pass, expected, `${name}: ${result.error ?? `expected pass=${expected}`}`)
  cases.push(result)
}
{
  const fixture = load('conformance/fixtures/valid-tui-channel.json')
  const result = validate('valid TUI channel envelopes', fixture, undefined, value => {
    validateTuiChannelRequirement(value.requirement)
    validateTuiChannelSupport(value.support)
    validateTuiChannelInput('open', value.open)
    validateTuiChannelSnapshot(value.snapshot)
  })
  assert.equal(result.pass, true, result.error)
  cases.push(result)
}
for (const [name, relative, expected] of [
  ['valid host descriptor', 'registry/host-descriptor.tui.example.json', true],
  ['host unknown protocol rejected', 'conformance/fixtures/invalid-host-unknown-contract.json', false],
  ['host profile hash mismatch rejected', 'conformance/fixtures/invalid-host-hash-mismatch.json', false],
  ['host unknown permission rejected', 'conformance/fixtures/invalid-host-unknown-permission.json', false],
  ['host duplicate protocol rejected', 'conformance/fixtures/invalid-host-duplicate-contract.json', false],
]) {
  const host = load(relative)
  const result = validate(name, host, schemas.host, validateHost)
  assert.equal(result.pass, expected, `${name}: ${result.error ?? `expected pass=${expected}`}`)
  cases.push(result)
}

const host = load('registry/host-descriptor.tui.example.json')
const minimalHost = load('conformance/fixtures/host-no-observe.example.json')
const negotiation = {
  compatible: admissionDecision('conformance/fixtures/valid-plugin.json', host),
  privateUnavailable: admissionDecision('conformance/fixtures/valid-private-protocol-plugin.json', host),
  waiting: admissionDecision('conformance/fixtures/waiting-authorization-plugin.json', host),
  authorized: admissionDecision('conformance/fixtures/waiting-authorization-plugin.json', host, ['messages.observe.read']),
  rejected: admissionDecision('conformance/fixtures/waiting-authorization-plugin.json', minimalHost),
  degraded: admissionDecision('conformance/fixtures/valid-plugin.json', minimalHost),
  unknown: admissionDecision('conformance/fixtures/unknown-version-plugin.json', host),
  compoundUnknown: admissionDecision('conformance/fixtures/plugin-compound-unknown.json', minimalHost),
  facetMismatch: admissionDecision('conformance/fixtures/valid-plugin.json', load('conformance/fixtures/invalid-host-facet-version.json')),
}
assert.equal(negotiation.compatible.decision, 'compatible')
assert.equal(negotiation.privateUnavailable.reasonCode, 'REQUIRED_PROTOCOL_UNAVAILABLE')
assert.equal(negotiation.waiting.decision, 'waiting_authorization')
assert.equal(negotiation.authorized.decision, 'compatible')
assert.equal(negotiation.rejected.decision, 'rejected')
assert.equal(negotiation.degraded.decision, 'compatible_degraded')
assert.equal(negotiation.unknown.decision, 'unknown')
assert.equal(negotiation.compoundUnknown.decision, 'unknown')
assert.equal(negotiation.facetMismatch.reasonCode, 'FACET_API_VERSION_UNAVAILABLE')

{
  const retractions = load('registry/retractions-0.15.json')
  assert.equal(retractions.profileVersion, 'tui-admission/0.15')
  assert.ok(Array.isArray(retractions.retractions), 'retractions must be an array')
  const retractionStates = new Set(['yanked', 'deleted'])
  function validateRetractionRecord(record) {
    if (!record.coordinates?.apiVersion || !record.coordinates?.kind) throw new Error('retraction requires coordinates')
    const key = `${record.coordinates.apiVersion}#${record.coordinates.kind}`
    if (!byCoordinate.has(key) && !byFamily.has(key)) throw new Error(`retraction targets unknown coordinate: ${key}`)
    if (!Array.isArray(record.retractedVersions) || record.retractedVersions.length === 0) throw new Error('retraction requires non-empty retractedVersions')
    if (!retractionStates.has(record.state)) throw new Error(`retraction state must be yanked or deleted: ${record.state}`)
    if (typeof record.reason !== 'string' || record.reason.length === 0) throw new Error('retraction requires reason')
    if (Number.isNaN(Date.parse(record.date))) throw new Error('retraction requires a valid date')
    if (record.affectedDigest !== undefined && !/^sha256:[0-9a-f]{64}$/u.test(record.affectedDigest)) throw new Error('affectedDigest must be sha256:hex')
  }
  for (const record of retractions.retractions) validateRetractionRecord(record)
  for (const [name, relative, expected] of [
    ['valid retraction record', 'conformance/fixtures/valid-retraction.json', true],
    ['retraction unknown coordinate rejected', 'conformance/fixtures/invalid-retraction-unknown-coordinate.json', false],
  ]) {
    const result = validate(name, load(relative), undefined, validateRetractionRecord)
    assert.equal(result.pass, expected, `${name}: ${result.error ?? `expected pass=${expected}`}`)
    cases.push(result)
  }
}

console.log(JSON.stringify({ suite: 'dsh-tui-admission-v0.15', std: profile.std, cases, negotiation }, null, 2))
