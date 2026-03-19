'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const { toSkillName } = require('../generator');
const { loadRegistry, removeEntry } = require('../registry');

const SKILLS_BASE = '.npm-skills/skills';

/**
 * Execute `npm-skills remove <package>`.
 * @param {string[]} args - positional args after "remove"
 * @param {{ cwd?: string }} options
 */
function remove(args, { cwd = process.cwd() } = {}) {
  const packageName = args[0];
  if (!packageName) {
    console.error('Usage: npm-skills remove <package>');
    process.exit(1);
  }

  const registry = loadRegistry(cwd);
  const entry = registry.packages[packageName];
  const skillName = entry ? entry.skillName : toSkillName(packageName);

  // Remove skill directory
  const skillDir = path.join(cwd, SKILLS_BASE, skillName);
  if (fs.existsSync(skillDir)) {
    fs.rmSync(skillDir, { recursive: true, force: true });
    console.log(`🗑  Removed skill directory: ${skillDir}`);
  } else {
    console.warn(`⚠ Skill directory not found: ${skillDir}`);
  }

  // Uninstall from agents via skills CLI
  try {
    execSync(`npx --yes skills remove "${skillName}" --yes`, {
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch {
    console.warn(`\n⚠ Could not auto-uninstall "${skillName}" from agents.`);
    console.warn(`  Run manually: npx skills remove "${skillName}"`);
  }

  const removed = removeEntry(packageName, cwd);
  if (removed) {
    console.log(`✅ Removed skill "${skillName}" for ${packageName}`);
  } else {
    console.log(`✅ Removed skill "${skillName}" (was not in registry)`);
  }
}

module.exports = { remove };
