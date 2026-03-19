'use strict';

const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  loadRegistry,
  saveRegistry,
  addEntry,
  removeEntry,
  listEntries,
  isEmpty,
} = require('../src/registry');

// ---------------------------------------------------------------------------
// Helpers — use a temporary directory per test
// ---------------------------------------------------------------------------

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'npm-skills-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// loadRegistry
// ---------------------------------------------------------------------------

test('loadRegistry: returns empty structure when file does not exist', () => {
  const registry = loadRegistry(tmpDir);
  assert.deepEqual(registry, { packages: {} });
});

test('loadRegistry: returns empty structure when file is malformed JSON', () => {
  const dir = path.join(tmpDir, '.npm-skills');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'registry.json'), 'NOT JSON', 'utf8');
  const registry = loadRegistry(tmpDir);
  assert.deepEqual(registry, { packages: {} });
});

test('loadRegistry: reads existing registry correctly', () => {
  const dir = path.join(tmpDir, '.npm-skills');
  fs.mkdirSync(dir, { recursive: true });
  const data = { packages: { lodash: { skillName: 'npm-lodash', version: '4.17.21', addedAt: '2024-01-01' } } };
  fs.writeFileSync(path.join(dir, 'registry.json'), JSON.stringify(data), 'utf8');
  const registry = loadRegistry(tmpDir);
  assert.deepEqual(registry, data);
});

// ---------------------------------------------------------------------------
// saveRegistry
// ---------------------------------------------------------------------------

test('saveRegistry: creates .npm-skills directory if missing', () => {
  saveRegistry({ packages: {} }, tmpDir);
  assert.ok(fs.existsSync(path.join(tmpDir, '.npm-skills', 'registry.json')));
});

test('saveRegistry: writes valid JSON', () => {
  const data = { packages: { axios: { skillName: 'npm-axios', version: '1.0.0', addedAt: '2024-01-01' } } };
  saveRegistry(data, tmpDir);
  const read = JSON.parse(fs.readFileSync(path.join(tmpDir, '.npm-skills', 'registry.json'), 'utf8'));
  assert.deepEqual(read, data);
});

// ---------------------------------------------------------------------------
// addEntry
// ---------------------------------------------------------------------------

test('addEntry: creates registry file with new entry', () => {
  addEntry('lodash', { skillName: 'npm-lodash', version: '4.17.21' }, tmpDir);
  const registry = loadRegistry(tmpDir);
  assert.equal(registry.packages.lodash.skillName, 'npm-lodash');
  assert.equal(registry.packages.lodash.version, '4.17.21');
  assert.ok(registry.packages.lodash.addedAt);
});

test('addEntry: overwrites existing entry with new version', () => {
  addEntry('lodash', { skillName: 'npm-lodash', version: '4.17.20' }, tmpDir);
  addEntry('lodash', { skillName: 'npm-lodash', version: '4.17.21' }, tmpDir);
  const registry = loadRegistry(tmpDir);
  assert.equal(registry.packages.lodash.version, '4.17.21');
});

test('addEntry: preserves other packages when adding new one', () => {
  addEntry('lodash', { skillName: 'npm-lodash', version: '4.17.21' }, tmpDir);
  addEntry('axios', { skillName: 'npm-axios', version: '1.0.0' }, tmpDir);
  const registry = loadRegistry(tmpDir);
  assert.ok(registry.packages.lodash);
  assert.ok(registry.packages.axios);
});

// ---------------------------------------------------------------------------
// removeEntry
// ---------------------------------------------------------------------------

test('removeEntry: returns false when package not registered', () => {
  const result = removeEntry('lodash', tmpDir);
  assert.equal(result, false);
});

test('removeEntry: returns true and removes the entry', () => {
  addEntry('lodash', { skillName: 'npm-lodash', version: '4.17.21' }, tmpDir);
  const result = removeEntry('lodash', tmpDir);
  assert.equal(result, true);
  const registry = loadRegistry(tmpDir);
  assert.equal(registry.packages.lodash, undefined);
});

test('removeEntry: does not remove other packages', () => {
  addEntry('lodash', { skillName: 'npm-lodash', version: '4.17.21' }, tmpDir);
  addEntry('axios', { skillName: 'npm-axios', version: '1.0.0' }, tmpDir);
  removeEntry('lodash', tmpDir);
  const registry = loadRegistry(tmpDir);
  assert.ok(registry.packages.axios);
});

// ---------------------------------------------------------------------------
// listEntries
// ---------------------------------------------------------------------------

test('listEntries: returns empty array when no entries', () => {
  const entries = listEntries(tmpDir);
  assert.deepEqual(entries, []);
});

test('listEntries: returns all entries with packageName merged in', () => {
  addEntry('lodash', { skillName: 'npm-lodash', version: '4.17.21' }, tmpDir);
  addEntry('axios', { skillName: 'npm-axios', version: '1.0.0' }, tmpDir);
  const entries = listEntries(tmpDir);
  assert.equal(entries.length, 2);
  const names = entries.map((e) => e.packageName).sort();
  assert.deepEqual(names, ['axios', 'lodash']);
});

test('listEntries: each entry has packageName, skillName, version, addedAt', () => {
  addEntry('lodash', { skillName: 'npm-lodash', version: '4.17.21' }, tmpDir);
  const [entry] = listEntries(tmpDir);
  assert.equal(entry.packageName, 'lodash');
  assert.equal(entry.skillName, 'npm-lodash');
  assert.equal(entry.version, '4.17.21');
  assert.ok(entry.addedAt);
});

// ---------------------------------------------------------------------------
// isEmpty
// ---------------------------------------------------------------------------

test('isEmpty: returns true when no packages registered', () => {
  assert.equal(isEmpty(tmpDir), true);
});

test('isEmpty: returns false after adding an entry', () => {
  addEntry('lodash', { skillName: 'npm-lodash', version: '4.17.21' }, tmpDir);
  assert.equal(isEmpty(tmpDir), false);
});
