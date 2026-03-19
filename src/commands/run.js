'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { getPackagesDir } = require('../paths');

/**
 * Execute `npm-skills run <bin-name> [-- args...]`.
 * Resolves the binary from ~/.npm-skills/packages/node_modules/.bin/ and
 * runs it with the given arguments.
 * @param {string[]} args - positional args after "run"
 */
function run(args) {
  const binName = args[0];
  if (!binName) {
    console.error('Usage: npm-skills run <bin-name> [-- args...]');
    process.exit(1);
  }

  // Collect extra args (everything after '--' separator or after binName)
  const separatorIdx = args.indexOf('--');
  const extraArgs = separatorIdx !== -1 ? args.slice(separatorIdx + 1) : args.slice(1);

  const binPath = path.join(getPackagesDir(), 'node_modules', '.bin', binName);
  if (!fs.existsSync(binPath)) {
    console.error(
      `\n❌ Binary "${binName}" not found at ${binPath}\n` +
      `   Run: npm-skills add <package> to install the package first.`
    );
    process.exit(1);
  }

  const result = spawnSync(binPath, extraArgs, {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: { ...process.env },
  });

  if (result.status !== null) {
    process.exit(result.status);
  }
  if (result.error) {
    console.error(`\n❌ Failed to run "${binName}": ${result.error.message}`);
    process.exit(1);
  }
}

module.exports = { run };
