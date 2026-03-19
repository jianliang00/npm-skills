'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { getPackagesDir } = require('./paths');

const README_SECTION_RE = /^#{1,3}\s+(usage|getting started|quick start|examples?|api)/i;
const MAX_README_LINES = 80;
const MAX_TYPE_LINES = 60;

/**
 * Extract a useful README summary from an installed package.
 * Looks for sections like "Usage", "Getting Started", "Quick Start", "Examples", "API".
 * Falls back to the first N lines if no matching sections are found.
 * @param {string} packageName
 * @returns {string}
 */
function extractReadmeSummary(packageName) {
  try {
    const pkgDir = path.join(getPackagesDir(), 'node_modules', packageName);
    const candidates = ['README.md', 'readme.md', 'Readme.md', 'README.MD'];
    let readmePath;
    for (const c of candidates) {
      const p = path.join(pkgDir, c);
      if (fs.existsSync(p)) {
        readmePath = p;
        break;
      }
    }
    if (!readmePath) return '';

    const lines = fs.readFileSync(readmePath, 'utf8').split('\n');

    // Try to extract named sections
    const sections = [];
    let inSection = false;
    let sectionLines = [];

    for (const line of lines) {
      if (/^#{1,3}\s/.test(line)) {
        if (inSection && sectionLines.length > 0) {
          sections.push(...sectionLines);
        }
        inSection = README_SECTION_RE.test(line);
        sectionLines = inSection ? [line] : [];
      } else if (inSection) {
        sectionLines.push(line);
      }
    }
    if (inSection && sectionLines.length > 0) {
      sections.push(...sectionLines);
    }

    const result = sections.length > 0 ? sections : lines;
    return result.slice(0, MAX_README_LINES).join('\n');
  } catch {
    return '';
  }
}

/**
 * Extract exported type signatures from an installed package's .d.ts file.
 * @param {string} packageName
 * @returns {string}
 */
function extractTypeSignatures(packageName) {
  try {
    const pkgDir = path.join(getPackagesDir(), 'node_modules', packageName);
    const pkgJsonPath = path.join(pkgDir, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) return '';

    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    const typesFile = pkgJson.types || pkgJson.typings;
    if (!typesFile) return '';

    const dtsPath = path.join(pkgDir, typesFile);
    if (!fs.existsSync(dtsPath)) return '';

    const lines = fs.readFileSync(dtsPath, 'utf8').split('\n');
    const exportLines = lines.filter((l) =>
      /export\s+(function|class|interface|type|const|default|enum|abstract)/.test(l)
    );

    return exportLines.slice(0, MAX_TYPE_LINES).join('\n');
  } catch {
    return '';
  }
}

module.exports = { extractReadmeSummary, extractTypeSignatures };
