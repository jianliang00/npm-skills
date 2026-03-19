'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { generateSkillContent, toSkillName, toIdentifier } = require('../src/generator');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeInfo(overrides = {}) {
  return {
    name: 'lodash',
    version: '4.17.21',
    description: 'Lodash modular utilities.',
    keywords: ['modules', 'stdlib', 'util'],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// toSkillName
// ---------------------------------------------------------------------------

test('toSkillName: plain package name', () => {
  assert.equal(toSkillName('lodash'), 'npm-lodash');
});

test('toSkillName: scoped package', () => {
  assert.equal(toSkillName('@types/node'), 'npm-types-node');
});

test('toSkillName: scoped package with hyphens', () => {
  assert.equal(toSkillName('@scope/my-package'), 'npm-scope-my-package');
});

// ---------------------------------------------------------------------------
// toIdentifier
// ---------------------------------------------------------------------------

test('toIdentifier: plain package', () => {
  assert.equal(toIdentifier('lodash'), 'lodash');
});

test('toIdentifier: hyphenated package', () => {
  assert.equal(toIdentifier('cross-env'), 'crossEnv');
});

test('toIdentifier: scoped package strips scope', () => {
  assert.equal(toIdentifier('@types/node'), 'node');
});

// ---------------------------------------------------------------------------
// generateSkillContent
// ---------------------------------------------------------------------------

test('generateSkillContent: returns correct skillName', () => {
  const { skillName } = generateSkillContent(makeInfo());
  assert.equal(skillName, 'npm-lodash');
});

test('generateSkillContent: YAML frontmatter contains name', () => {
  const { content } = generateSkillContent(makeInfo());
  assert.ok(content.includes('name: npm-lodash'), 'missing YAML name');
});

test('generateSkillContent: YAML frontmatter contains description', () => {
  const { content } = generateSkillContent(makeInfo());
  assert.ok(content.includes('Lodash modular utilities'), 'missing description text');
});

test('generateSkillContent: frontmatter has generated: true', () => {
  const { content } = generateSkillContent(makeInfo());
  assert.ok(content.includes('generated: true'));
});

test('generateSkillContent: frontmatter has package name', () => {
  const { content } = generateSkillContent(makeInfo());
  assert.ok(content.includes('"lodash"'));
});

test('generateSkillContent: frontmatter has version', () => {
  const { content } = generateSkillContent(makeInfo());
  assert.ok(content.includes('"4.17.21"'));
});

test('generateSkillContent: includes npm registry link', () => {
  const { content } = generateSkillContent(makeInfo());
  // Check for the exact markdown link produced by the generator
  assert.match(content, /\[npm\]\(https:\/\/www\.npmjs\.com\/package\/lodash\)/);
});

test('generateSkillContent: includes install command', () => {
  const { content } = generateSkillContent(makeInfo());
  assert.ok(content.includes('npm install lodash'));
});

test('generateSkillContent: includes API import snippet', () => {
  const { content } = generateSkillContent(makeInfo());
  assert.ok(content.includes("require('lodash')"));
  assert.ok(content.includes("import lodash from 'lodash'"));
});

test('generateSkillContent: includes keywords section when present', () => {
  const { content } = generateSkillContent(makeInfo());
  assert.ok(content.includes('## Topics'));
  assert.ok(content.includes('- modules'));
});

test('generateSkillContent: no keywords section when empty', () => {
  const { content } = generateSkillContent(makeInfo({ keywords: [] }));
  assert.ok(!content.includes('## Topics'));
});

test('generateSkillContent: no keywords section when undefined', () => {
  const info = makeInfo();
  delete info.keywords;
  const { content } = generateSkillContent(info);
  assert.ok(!content.includes('## Topics'));
});

test('generateSkillContent: scoped package produces correct skill name', () => {
  const { skillName, content } = generateSkillContent(makeInfo({ name: '@scope/pkg' }));
  assert.equal(skillName, 'npm-scope-pkg');
  assert.ok(content.includes('name: npm-scope-pkg'));
});

test('generateSkillContent: includes CLI section when bin is a string', () => {
  const { content } = generateSkillContent(makeInfo({ name: 'mycli', bin: './cli.js' }));
  assert.ok(content.includes('## CLI Usage'));
  assert.ok(content.includes('npx mycli'));
});

test('generateSkillContent: includes CLI section when bin is an object', () => {
  const { content } = generateSkillContent(
    makeInfo({ name: 'mytool', bin: { mytool: './bin.js', mytool2: './bin2.js' } })
  );
  assert.ok(content.includes('## CLI Usage'));
  assert.ok(content.includes('npx mytool'));
  assert.ok(content.includes('npx mytool2'));
});

test('generateSkillContent: no CLI section when bin is absent', () => {
  const info = makeInfo();
  delete info.bin;
  const { content } = generateSkillContent(info);
  assert.ok(!content.includes('## CLI Usage'));
});

test('generateSkillContent: includes repository URL when present', () => {
  const { content } = generateSkillContent(
    makeInfo({ repository: { type: 'git', url: 'https://github.com/lodash/lodash' } })
  );
  // Check for the exact Repository line produced by the generator
  assert.match(content, /\*\*Repository\*\*: https:\/\/github\.com\/lodash\/lodash/);
});

test('generateSkillContent: strips git+ prefix from repository URL', () => {
  const { content } = generateSkillContent(
    makeInfo({ repository: { url: 'git+https://github.com/lodash/lodash.git' } })
  );
  assert.match(content, /\*\*Repository\*\*: https:\/\/github\.com\/lodash\/lodash\.git/);
  assert.doesNotMatch(content, /git\+https/);
});

test('generateSkillContent: no repository line when absent', () => {
  const info = makeInfo();
  delete info.repository;
  const { content } = generateSkillContent(info);
  assert.ok(!content.includes('**Repository**'));
});

test('generateSkillContent: no description fallback when undefined', () => {
  const info = makeInfo();
  delete info.description;
  const { content } = generateSkillContent(info);
  // Should still produce valid content (use fallback text)
  assert.ok(content.includes('npm package'));
});
