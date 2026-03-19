'use strict';

const os = require('node:os');
const path = require('node:path');

function getGlobalDir() {
  return path.join(os.homedir(), '.npm-skills');
}

function getPackagesDir() {
  return path.join(getGlobalDir(), 'packages');
}

function getSkillsDir() {
  return path.join(getGlobalDir(), 'skills');
}

module.exports = { getGlobalDir, getPackagesDir, getSkillsDir };
