'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REGISTRY_FILE = '.npm-skills/registry.json';

/**
 * Load the registry from disk, returning an empty structure if it doesn't exist.
 * @param {string} [cwd] - project root (defaults to process.cwd())
 * @returns {{ packages: Record<string, { skillName: string, version: string, addedAt: string }> }}
 */
function loadRegistry(cwd = process.cwd()) {
  const registryPath = path.join(cwd, REGISTRY_FILE);
  if (!fs.existsSync(registryPath)) {
    return { packages: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  } catch {
    return { packages: {} };
  }
}

/**
 * Persist the registry to disk.
 * @param {object} registry
 * @param {string} [cwd]
 */
function saveRegistry(registry, cwd = process.cwd()) {
  const registryPath = path.join(cwd, REGISTRY_FILE);
  const dir = path.dirname(registryPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n', 'utf8');
}

/**
 * Add or update a package entry in the registry.
 * @param {string} packageName
 * @param {{ skillName: string, version: string }} entry
 * @param {string} [cwd]
 */
function addEntry(packageName, entry, cwd = process.cwd()) {
  const registry = loadRegistry(cwd);
  registry.packages[packageName] = {
    skillName: entry.skillName,
    version: entry.version,
    addedAt: new Date().toISOString(),
  };
  saveRegistry(registry, cwd);
}

/**
 * Remove a package entry from the registry.
 * @param {string} packageName
 * @param {string} [cwd]
 * @returns {boolean} true if the entry existed and was removed
 */
function removeEntry(packageName, cwd = process.cwd()) {
  const registry = loadRegistry(cwd);
  if (!registry.packages[packageName]) {
    return false;
  }
  delete registry.packages[packageName];
  saveRegistry(registry, cwd);
  return true;
}

/**
 * List all registered packages.
 * @param {string} [cwd]
 * @returns {Array<{ packageName: string, skillName: string, version: string, addedAt: string }>}
 */
function listEntries(cwd = process.cwd()) {
  const registry = loadRegistry(cwd);
  return Object.entries(registry.packages).map(([packageName, data]) => ({
    packageName,
    ...data,
  }));
}

/**
 * Return true if any package has been registered (used to decide whether to
 * bootstrap the guide skill).
 * @param {string} [cwd]
 * @returns {boolean}
 */
function isEmpty(cwd = process.cwd()) {
  const registry = loadRegistry(cwd);
  return Object.keys(registry.packages).length === 0;
}

module.exports = { loadRegistry, saveRegistry, addEntry, removeEntry, listEntries, isEmpty };
