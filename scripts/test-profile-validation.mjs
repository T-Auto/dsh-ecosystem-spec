#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateProfileEntry, validateProfileEntries } from './profile-validation.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const load = (name) => JSON.parse(readFileSync(join(ROOT, 'fixtures', 'profile', name), 'utf8'));
const expectValid = (name) => assert.deepEqual(validateProfileEntry(load(name)), [], name);
const expectInvalid = (name, text) => {
  const errors = validateProfileEntry(load(name));
  assert.ok(errors.some((error) => error.includes(text)), `${name}: expected ${text}; got ${errors.join('; ')}`);
};

const source = load('valid-external-tui-profile.json').source;
assert.equal(source.path, 'tui-profile/registry/registry-0.15.json');
assert.equal(source.contentDigest, 'sha256:c3090dd129aadb06f87b56ad148dfbcec2ce4eed2404dda5eed9cf1dbae51f54');
const sourceBytes = readFileSync(join(ROOT, 'fixtures', 'profile', 'source-registry-0.15.json'));
assert.equal(`sha256:${createHash('sha256').update(sourceBytes).digest('hex')}`, source.contentDigest);
assert.deepEqual(source.imports, ['@dsh-std/command', '@dsh-std/storage', '@dsh-std/messages', '@dsh-std/presentation']);

expectValid('valid-external-tui-profile.json');
expectValid('valid-legacy-profile.json');
expectInvalid('invalid-status-policy.json', 'maturityPolicy.kind');
expectInvalid('invalid-missing-source-fields.json', 'source missing revision');
expectInvalid('invalid-path-escape.json', 'source.path');
const malformedPath = load('valid-external-tui-profile.json');
malformedPath.source.path = 'registry//profile.json';
assert.ok(validateProfileEntry(malformedPath).some((error) => error.includes('source.path')));
const duplicate = load('invalid-duplicate-id.json');
assert.ok(validateProfileEntries(duplicate.entries).some((error) => error.includes('duplicate id')));
console.log('profile validation fixtures passed');
