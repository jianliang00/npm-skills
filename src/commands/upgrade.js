'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const { fetchPackageInfo, generateSkillContent } = require('../generator');
const { addEntry, loadRegistry } = require('../registry');

const SKILLS_BASE = '.npm-skills/skills';

/**
 * Execute `npm-skills upgrade <package>`.
 * Regenerates the SKILL.md from the latest npm package info and re-installs.
 * @param {string[]} args - positional args after "upgrade"
 * @param {{ cwd?: string }} options
 */
function upgrade(args, { cwd = process.cwd() } = {}) {
  const packageName = args[0];
  if (!packageName) {
    console.error('Usage: npm-skills upgrade <package>');
    process.exit(1);
  }

  const registry = loadRegistry(cwd);
  const entry = registry.packages[packageName];
  const oldVersion = entry ? entry.version : '(unknown)';

  console.log(`\n📦 Fetching latest info for "${packageName}" …`);
  const info = fetchPackageInfo(packageName);
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

module.exports = { upgrade };
