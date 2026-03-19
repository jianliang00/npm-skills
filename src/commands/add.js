'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const { fetchPackageInfo, generateSkillContent } = require('../generator');
const { addEntry, isEmpty } = require('../registry');
const { guideSkillContent } = require('../guide');

const SKILLS_BASE = '.npm-skills/skills';
const GUIDE_SKILL_NAME = 'npm-skills-guide';

/**
 * Write a skill directory with its SKILL.md to the project's .npm-skills folder.
 * @param {string} skillName
 * @param {string} content
 * @param {string} cwd
 * @returns {string} path to the skill directory
 */
function writeSkillDir(skillName, content, cwd) {
  const skillDir = path.join(cwd, SKILLS_BASE, skillName);
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
 * Writes the guide SKILL.md to .npm-skills/skills/npm-skills-guide/ and
 * installs it so agents can read it.
 * @param {string} cwd
 */
function bootstrapGuide(cwd) {
  const guideDir = path.join(cwd, SKILLS_BASE, GUIDE_SKILL_NAME);
  if (fs.existsSync(path.join(guideDir, 'SKILL.md'))) {
    return; // already present
  }
  console.log('\n⚡ First run — installing npm-skills-guide …');
  const content = guideSkillContent();
  writeSkillDir(GUIDE_SKILL_NAME, content, cwd);
  installSkill(guideDir);
}

/**
 * Execute `npm-skills add <package>`.
 * @param {string[]} args - positional args after "add"
 * @param {{ cwd?: string }} options
 */
function add(args, { cwd = process.cwd() } = {}) {
  const packageName = args[0];
  if (!packageName) {
    console.error('Usage: npm-skills add <package>');
    process.exit(1);
  }

  // Bootstrap guide on first use (before adding an entry, so isEmpty() works)
  if (isEmpty(cwd)) {
    bootstrapGuide(cwd);
  }

  console.log(`\n📦 Fetching info for "${packageName}" …`);
  const info = fetchPackageInfo(packageName);
  const { skillName, content } = generateSkillContent(info);

  console.log(`✏  Generating skill "${skillName}" …`);
  const skillDir = writeSkillDir(skillName, content, cwd);

  console.log(`📝 Installing skill via skills CLI …`);
  installSkill(skillDir);

  addEntry(packageName, { skillName, version: info.version }, cwd);
  console.log(`✅ Added skill "${skillName}" for ${packageName}@${info.version}`);
}

module.exports = { add };
