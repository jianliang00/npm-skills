#!/usr/bin/env node
'use strict';

const { parseArgs } = require('node:util');
const { listEntries } = require('../src/registry');
const { getGlobalDir } = require('../src/paths');

const HELP = `
npm-skills — convert npm packages into installable AI agent skills

Usage:
  npm-skills add <package>       Generate and install a skill for an npm package
  npm-skills remove <package>    Remove a skill and uninstall it from agents
  npm-skills upgrade <package[@version]>  Upgrade a skill to the latest or a specified version
  npm-skills list                List all registered npm skills
  npm-skills run <bin> [-- args] Run a CLI binary from an installed skill package
  npm-skills exec -e "<code>"    Execute inline JS/ESM using installed skill packages
  npm-skills exec <script>       Execute a script file using installed skill packages

Options:
  --help, -h    Show this help message
`.trim();

const { positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  strict: false,
});

const [command, ...rest] = positionals;

if (!command || command === '--help' || command === '-h') {
  console.log(HELP);
  process.exit(0);
}

switch (command) {
  case 'add': {
    const { add } = require('../src/commands/add');
    add(rest);
    break;
  }
  case 'remove':
  case 'rm': {
    const { remove } = require('../src/commands/remove');
    remove(rest);
    break;
  }
  case 'upgrade':
  case 'update': {
    const { upgrade } = require('../src/commands/upgrade');
    upgrade(rest);
    break;
  }
  case 'list':
  case 'ls': {
    const entries = listEntries(getGlobalDir());
    if (entries.length === 0) {
      console.log('No npm skills installed. Run: npm-skills add <package>');
    } else {
      console.log('Installed npm skills:\n');
      for (const e of entries) {
        console.log(`  ${e.skillName}  (${e.packageName}@${e.version})`);
      }
    }
    break;
  }
  case 'run': {
    const { run } = require('../src/commands/run');
    run(rest);
    break;
  }
  case 'exec': {
    const { exec } = require('../src/commands/exec');
    exec(rest);
    break;
  }
  default:
    console.error(`Unknown command: "${command}"\n`);
    console.log(HELP);
    process.exit(1);
}
