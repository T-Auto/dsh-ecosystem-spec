const STATUS = new Set(['Draft', 'Experimental', 'Candidate', 'Stable', 'Deprecated']);
const REPOSITORY = /^https:\/\/github\.com\/[^/]+\/[^/]+\.git$/;
const REVISION = /^[0-9a-f]{40}$/;
const PATH = /^[A-Za-z0-9._/-]+$/;
const DIGEST = /^sha256:[0-9a-f]{64}$/;

function isSafeRelativePath(value) {
  return typeof value === 'string'
    && PATH.test(value)
    && value.split('/').every((segment) => segment && segment !== '.' && segment !== '..');
}

export function validateProfileEntry(entry, where = 'profile entry') {
  const errors = [];
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return [`${where} must be an object`];
  }
  const has = (key) => Object.prototype.hasOwnProperty.call(entry, key);
  const requireField = (key) => {
    if (!has(key)) errors.push(`${where} missing ${key}`);
  };

  for (const key of ['id', 'displayName', 'category', 'scope', 'owner', 'doc']) requireField(key);
  if (has('category') && entry.category !== 'profile') errors.push(`${where} category must be profile`);

  const legacy = has('status');
  const external = has('maturityPolicy') || has('source');
  if (legacy === external || (!legacy && !external)) {
    errors.push(`${where} must use exactly one maturity branch: status or maturityPolicy + source`);
  }
  if (legacy) {
    if (!STATUS.has(entry.status)) errors.push(`${where} status must be a governance status`);
    if (has('statusSource') && entry.statusSource !== 'upstream') {
      errors.push(`${where} statusSource must be upstream`);
    }
    if (has('maturityPolicy') || has('source')) errors.push(`${where} legacy status cannot have external maturity fields`);
  }

  if (external) {
    if (!has('maturityPolicy') || !entry.maturityPolicy || typeof entry.maturityPolicy !== 'object' || Array.isArray(entry.maturityPolicy) || entry.maturityPolicy.kind !== 'not-applicable') {
      errors.push(`${where} maturityPolicy.kind must be not-applicable`);
    }
    if (entry.maturityPolicy && typeof entry.maturityPolicy === 'object' && typeof entry.maturityPolicy.source !== 'string') {
      errors.push(`${where} maturityPolicy.source is required`);
    }
    const source = entry.source;
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      errors.push(`${where} source is required`);
    } else {
      for (const key of ['repository', 'revision', 'path', 'contentDigest', 'productVersions', 'imports', 'suite']) {
        if (!Object.prototype.hasOwnProperty.call(source, key)) errors.push(`${where} source missing ${key}`);
      }
      if (typeof source.repository !== 'string' || !REPOSITORY.test(source.repository)) {
        errors.push(`${where} source.repository must be a GitHub .git URL`);
      }
      if (typeof source.revision !== 'string' || !REVISION.test(source.revision)) {
        errors.push(`${where} source.revision must be a lowercase 40-hex commit`);
      }
      if (!isSafeRelativePath(source.path)) {
        errors.push(`${where} source.path must be a relative POSIX path without traversal`);
      }
      if (typeof source.contentDigest !== 'string' || !DIGEST.test(source.contentDigest)) {
        errors.push(`${where} source.contentDigest must be sha256:<64 lowercase hex>`);
      }
      if (!Array.isArray(source.productVersions) || source.productVersions.length === 0 || source.productVersions.some((v) => typeof v !== 'string' || !v)) {
        errors.push(`${where} source.productVersions must be a non-empty string array`);
      }
      if (!Array.isArray(source.imports) || source.imports.some((v) => typeof v !== 'string' || !v)) {
        errors.push(`${where} source.imports must be a string array`);
      }
      if (!source.suite || typeof source.suite !== 'object' || typeof source.suite.id !== 'string' || !source.suite.id || typeof source.suite.version !== 'string' || !source.suite.version) {
        errors.push(`${where} source.suite requires id and version`);
      }
    }
  }
  return errors;
}

export function validateProfileEntries(entries, where = 'profiles') {
  const errors = [];
  const seen = new Set();
  entries.forEach((entry, index) => {
    const label = `${where}[${index}]`;
    errors.push(...validateProfileEntry(entry, label));
    if (seen.has(entry.id)) errors.push(`${label} duplicate id ${entry.id}`);
    if (entry.id !== undefined) seen.add(entry.id);
  });
  return errors;
}
