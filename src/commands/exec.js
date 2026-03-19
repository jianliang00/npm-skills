'use strict';

const { spawnSync } = require('node:child_process');
const { getPackagesDir } = require('../paths');

/**
 * Execute `npm-skills exec -e "<inline code>"` or `npm-skills exec <script-file>`.
 * Sets NODE_PATH to ~/.npm-skills/packages/node_modules so require/import
 * can find installed packages.
 * @param {string[]} args - positional args after "exec"
 */
function exec(args) {
  if (args.length === 0) {
    console.error('Usage: npm-skills exec -e "<inline code>"');
    console.error('       npm-skills exec <script-file>');
    process.exit(1);
  }

  const nodePath = `${getPackagesDir()}/node_modules`;
  const env = {
    ...process.env,
    NODE_PATH: process.env.NODE_PATH
      ? `${nodePath}:${process.env.NODE_PATH}`
      : nodePath,
  };

  let result;
  if (args[0] === '-e') {
    const code = args.slice(1).join(' ');
    if (!code) {
      console.error('Usage: npm-skills exec -e "<inline code>"');
      process.exit(1);
    }
    // Run as CommonJS by default so require() works; use .mjs extension for ESM
    result = spawnSync(process.execPath, ['-e', code], {
      cwd: process.cwd(),
      stdio: 'inherit',
      env,
    });
  } else {
    const scriptFile = args[0];
    result = spawnSync(process.execPath, [scriptFile, ...args.slice(1)], {
      cwd: process.cwd(),
      stdio: 'inherit',
      env,
    });
  }

  if (result.status !== null) {
    process.exit(result.status);
  }
  if (result.error) {
    console.error(`\n❌ Failed to execute: ${result.error.message}`);
    process.exit(1);
  }
}

module.exports = { exec };
