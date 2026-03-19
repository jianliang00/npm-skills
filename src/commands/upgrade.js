'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const { fetchPackageInfo, generateSkillContent } = require('../generator');
const { addEntry, loadRegistry } = require('../registry');

const SKILLS_BASE = '.npm-skills/skills';

/**
 * Parse a package argument that may contain an optional version specifier.
 * Handles plain names ("lodash"), scoped packages ("@types/node"), and
 * versioned forms ("lodash@4.17.21", "@types/node@18.0.0").
 *
 * @param {string} arg - raw argument from the CLI
 * @returns {{ packageName: string, targetSpec: string }}
 *   packageName — bare name used as the registry key (e.g. "lodash")
 *   targetSpec  — spec passed to `npm view` (e.g. "lodash@4.17.21")
 */
function parsePackageSpec(arg) {
  if (arg.startsWith('@')) {
    // Scoped package: look for a second '@' that separates scope/name from version
    const versionAt = arg.indexOf('@', 1);
    if (versionAt === -1) {
      return { packageName: arg, targetSpec: arg };
    }
    return { packageName: arg.slice(0, versionAt), targetSpec: arg };
  }
  const atIdx = arg.indexOf('@');
  if (atIdx === -1) {
    return { packageName: arg, targetSpec: arg };
  }
  return { packageName: arg.slice(0, atIdx), targetSpec: arg };
}

/**
 * Execute `npm-skills upgrade <package[@version]>`.
 * Regenerates the SKILL.md from the latest (or specified) npm package info
 * and re-installs.
 * @param {string[]} args - positional args after "upgrade"
 * @param {{ cwd?: string }} options
 */
function upgrade(args, { cwd = process.cwd() } = {}) {
  const rawArg = args[0];
  if (!rawArg) {
    console.error('Usage: npm-skills upgrade <package[@version]>');
    process.exit(1);
  }

  const { packageName, targetSpec } = parsePackageSpec(rawArg);

  const registry = loadRegistry(cwd);
  const entry = registry.packages[packageName];
  const oldVersion = entry ? entry.version : '(unknown)';

  const fetchLabel = targetSpec === packageName
    ? 'latest info'
    : `info for version ${targetSpec.slice(targetSpec.lastIndexOf('@') + 1)}`;
  console.log(`\n📦 Fetching ${fetchLabel} for "${packageName}" …`);
  const info = fetchPackageInfo(targetSpec);
  const { skillName, content } = generateSkillContent(info);

  if (entry && entry.version === info.version) {
    console.log(`ℹ  "${skillName}" is already at the latest version (${info.version}).`);
  }

  // Overwrite the SKILL.md
  const skillDir = path.join(cwd, SKILLS_BASE, skillName);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), content, 'utf8');
  console.log(`✏  Updated SKILL.md for "${skillName}"`);

  // Re-install
  try {
    execSync(`npx --yes skills add "${skillDir}"`, {
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch {
    console.warn(`\n⚠ Could not auto-update skill in agents.`);
    console.warn(`  Run manually: npx skills add "${skillDir}"`);
  }

  addEntry(packageName, { skillName, version: info.version }, cwd);
  console.log(
    `✅ Upgraded "${skillName}" from ${oldVersion} → ${info.version}`
  );
}

module.exports = { upgrade, parsePackageSpec };
