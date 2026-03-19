'use strict';

const { execSync } = require('node:child_process');
const { extractReadmeSummary, extractTypeSignatures } = require('./extractor');

/**
 * Fetch metadata for an npm package via `npm view`.
 * @param {string} packageName - e.g. "lodash" or "@types/node"
 * @returns {object} parsed npm view JSON
 */
function fetchPackageInfo(packageName) {
  try {
    const raw = execSync(`npm view ${packageName} --json`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return JSON.parse(raw);
  } catch (err) {
    const message = err.stderr ? err.stderr.trim() : err.message;
    throw new Error(`Failed to fetch info for "${packageName}": ${message}`);
  }
}

/**
 * Convert an npm package name to a safe skill name.
 * Scoped packages like "@org/name" become "npm-org-name".
 * @param {string} packageName
 * @returns {string}
 */
function toSkillName(packageName) {
  return 'npm-' + packageName.replace(/^@/, '').replace(/[/@]/g, '-');
}

/**
 * Derive a short JS identifier from a package name for import examples.
 * @param {string} packageName
 * @returns {string}
 */
function toIdentifier(packageName) {
  const bare = packageName.replace(/^@[^/]+\//, '');
  return bare.replace(/[-_]([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Build the YAML frontmatter block for a skill.
 * @param {object} info - npm package info
 * @returns {string}
 */
function buildFrontmatter(info) {
  const skillName = toSkillName(info.name);
  const rawDesc = (info.description || 'npm package').replace(/\.+$/, '');
  const description =
    `Use the ${info.name} npm package (v${info.version}). ` +
    `${rawDesc}. ` +
    `Install with: npm install ${info.name}`;

  const lines = [
    '---',
    `name: ${skillName}`,
    'description: >',
    `  ${description}`,
    'metadata:',
    '  source: npm',
    `  package: "${info.name}"`,
    `  version: "${info.version}"`,
    '  generated: true',
    '  installed: true',
    '---',
  ];
  return lines.join('\n');
}

/**
 * Build the CLI usage section if the package has `bin` entries.
 * @param {object} info
 * @returns {string}
 */
function buildCliSection(info) {
  if (!info.bin) return '';

  const entries =
    typeof info.bin === 'string'
      ? [[info.name, info.bin]]
      : Object.entries(info.bin);

  if (entries.length === 0) return '';

  const blocks = entries.map(([cmd]) => `\`\`\`bash\nnpx ${cmd} [options]\n\`\`\``);

  return `\n## CLI Usage\n\n${blocks.join('\n\n')}\n`;
}

/**
 * Build the programmatic API section.
 * @param {object} info
 * @returns {string}
 */
function buildApiSection(info) {
  const id = toIdentifier(info.name);

  return `\n## API Usage\n\n\`\`\`javascript\n// CommonJS\nconst ${id} = require('${info.name}');\n\n// ESM\nimport ${id} from '${info.name}';\n\`\`\`\n`;
}

/**
 * Build the topics/keywords section.
 * @param {object} info
 * @returns {string}
 */
function buildKeywordsSection(info) {
  if (!info.keywords || info.keywords.length === 0) return '';
  const items = info.keywords
    .slice(0, 10)
    .map((k) => `- ${k}`)
    .join('\n');
  return `\n## Topics\n\n${items}\n`;
}

/**
 * Build the "How to Use This Package" section showing npm-skills run/exec usage.
 * @param {object} info
 * @returns {string}
 */
function buildHowToUseSection(info) {
  const lines = ['\n## How to Use This Package\n'];

  if (info.bin) {
    const entries =
      typeof info.bin === 'string'
        ? [[info.name, info.bin]]
        : Object.entries(info.bin);
    if (entries.length > 0) {
      lines.push('Run CLI commands via `npm-skills run`:\n');
      for (const [cmd] of entries) {
        lines.push('```bash', `npm-skills run ${cmd} -- [args]`, '```');
      }
      lines.push('');
    }
  }

  lines.push('Run inline JavaScript that uses this package:\n');
  lines.push(
    '```bash',
    `npm-skills exec -e "const pkg = require('${info.name}'); console.log(pkg);"`,
    '```'
  );
  lines.push('');
  lines.push('Run a script file that uses this package:\n');
  lines.push('```bash', 'npm-skills exec script.mjs', '```', '');

  return lines.join('\n');
}

/**
 * Build the README usage examples section from the installed package.
 * @param {string} packageName
 * @returns {string}
 */
function buildReadmeSection(packageName) {
  const summary = extractReadmeSummary(packageName);
  if (!summary) return '';
  return `\n## Usage Examples (from README)\n\n${summary}\n`;
}

/**
 * Build the key API reference section from the installed package's type definitions.
 * @param {string} packageName
 * @returns {string}
 */
function buildTypeSignatureSection(packageName) {
  const sigs = extractTypeSignatures(packageName);
  if (!sigs) return '';
  return `\n## Key API Reference\n\n\`\`\`typescript\n${sigs}\n\`\`\`\n`;
}

/**
 * Generate a complete SKILL.md document for an npm package.
 * @param {object} info - npm view JSON for the package
 * @returns {{ skillName: string, content: string }}
 */
function generateSkillContent(info) {
  const skillName = toSkillName(info.name);
  const repoUrl = info.repository
    ? typeof info.repository === 'string'
      ? info.repository
      : info.repository.url || ''
    : '';

  const sections = [
    buildFrontmatter(info),
    '',
    `# ${info.name}`,
    '',
    info.description || '',
    '',
    '## Package Information',
    '',
    `- **Package**: \`${info.name}\``,
    `- **Version**: \`${info.version}\``,
    `- **Registry**: [npm](https://www.npmjs.com/package/${info.name})`,
    repoUrl ? `- **Repository**: ${repoUrl.replace(/^git\+/, '')}` : '',
    `- **Status**: ✅ Installed locally`,
    '',
    '## Installation',
    '',
    '```bash',
    `npm install ${info.name}`,
    '```',
  ].filter((line) => line !== undefined);

  let content = sections.join('\n');
  content += buildHowToUseSection(info);
  content += buildCliSection(info);
  content += buildApiSection(info);
  content += buildTypeSignatureSection(info.name);
  content += buildReadmeSection(info.name);
  content += buildKeywordsSection(info);

  return { skillName, content };
}

module.exports = { fetchPackageInfo, generateSkillContent, toSkillName, toIdentifier };
