'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const { getPackagesDir } = require('./paths');

/**
 * Ensure ~/.npm-skills/packages/ has a package.json, then install packageSpec.
 * @param {string} packageSpec - e.g. "lodash" or "lodash@4.17.21"
 */
function installPackage(packageSpec) {
  const pkgDir = getPackagesDir();
  fs.mkdirSync(pkgDir, { recursive: true });

  const pkgJson = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(pkgJson)) {
    try {
      execSync('npm init -y', { cwd: pkgDir, stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (err) {
      console.warn(`\n⚠ Could not initialise packages directory: ${err.message}`);
    }
  }

  try {
    execSync(`npm install ${packageSpec}`, {
      cwd: pkgDir,
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch {
    console.warn(`\n⚠ Could not install "${packageSpec}" to ${pkgDir}`);
    console.warn(`  Run manually: cd "${pkgDir}" && npm install ${packageSpec}`);
  }
}

/**
 * Uninstall packageName from ~/.npm-skills/packages/.
 * @param {string} packageName - bare package name (no version)
 */
function uninstallPackage(packageName) {
  const pkgDir = getPackagesDir();
  if (!fs.existsSync(pkgDir)) {
    return;
  }

  try {
    execSync(`npm uninstall ${packageName}`, {
      cwd: pkgDir,
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch {
    console.warn(`\n⚠ Could not uninstall "${packageName}" from ${pkgDir}`);
    console.warn(`  Run manually: cd "${pkgDir}" && npm uninstall ${packageName}`);
  }
}

module.exports = { installPackage, uninstallPackage };
