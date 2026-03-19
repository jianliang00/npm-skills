'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Return the absolute path to the bundled npm-skills-guide skill directory.
 */
function guideSkillDir() {
  return path.join(__dirname, '..', 'skills', 'npm-skills-guide');
}

/**
 * Return the content of the bundled SKILL.md for npm-skills-guide.
 * @returns {string}
 */
function guideSkillContent() {
  return fs.readFileSync(path.join(guideSkillDir(), 'SKILL.md'), 'utf8');
}

module.exports = { guideSkillDir, guideSkillContent };
