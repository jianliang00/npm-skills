'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const { parseArgs } = require('node:util');
const { fetchPackageInfo, generateSkillContent } = require('../generator');
const { addEntry, isEmpty } = require('../registry');
const { guideSkillContent } = require('../guide');
const { installPackage } = require('../installer');
const { getGlobalDir, getSkillsDir } = require('../paths');

const GUIDE_SKILL_NAME = 'npm-skills-guide';

/**
 * Write a skill directory with its SKILL.md to the global skills folder.
 * @param {string} skillName
 * @param {string} content
 * @returns {string} path to the skill directory
 */
function writeSkillDir(skillName, content) {
  const skillDir = path.join(getSkillsDir(), skillName);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), content, 'utf8');
  return skillDir;
}

/**
 * Install a skill directory using the `skills` CLI.
 * Failures are printed but do not abort the whole add operation, since the
 * skill files are already written.
 * @param {string} skillDir - absolute or relative path accepted by `skills add`
 */
function installSkill(skillDir) {
  try {
    execSync(`npx --yes skills add "${skillDir}"`, {
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch {
    console.warn(`\n⚠ Could not auto-install skill from ${skillDir}`);
    console.warn(`  Run manually: npx skills add "${skillDir}"`);
  }
}

/**
 * Bootstrap the npm-skills-guide skill on first use.
 * Writes the guide SKILL.md to the global skills directory and installs it.
 */
function bootstrapGuide() {
  const guideDir = path.join(getSkillsDir(), GUIDE_SKILL_NAME);
  if (fs.existsSync(path.join(guideDir, 'SKILL.md'))) {
    return; // already present
  }
  console.log('\n⚡ First run — installing npm-skills-guide …');
  const content = guideSkillContent();
  writeSkillDir(GUIDE_SKILL_NAME, content);
  installSkill(guideDir);
}

/**
 * Execute `npm-skills add <package>`.
 * @param {string[]} args - positional args after "add"
 * @param {{ cwd?: string }} options
 */
function add(args, { cwd = process.cwd() } = {}) {
  const { positionals, values } = parseArgs({
    args,
    allowPositionals: true,
    strict: false,
    options: {
      'no-install': { type: 'boolean', default: false },
    },
  });

  const packageName = positionals[0];
  if (!packageName) {
    console.error('Usage: npm-skills add <package> [--no-install]');
    console.error('       --no-install  Skip package installation (if already installed manually)');
    process.exit(1);
  }

  const skipInstall = values['no-install'];

  // Bootstrap guide on first use (before adding an entry, so isEmpty() works)
  if (isEmpty(getGlobalDir())) {
    bootstrapGuide();
  }

  console.log(`\n📦 Fetching info for "${packageName}" …`);
  const info = fetchPackageInfo(packageName);

  if (!skipInstall) {
    console.log(`⬇  Installing "${packageName}" to ~/.npm-skills/packages/ …`);
    installPackage(packageName);
  }

  const { skillName, content } = generateSkillContent(info);

  console.log(`✏  Generating skill "${skillName}" …`);
  const skillDir = writeSkillDir(skillName, content);

  console.log(`📝 Installing skill via skills CLI …`);
  installSkill(skillDir);

  addEntry(packageName, { skillName, version: info.version }, getGlobalDir());
  console.log(`✅ Added skill "${skillName}" for ${packageName}@${info.version}`);
}

module.exports = { add };
