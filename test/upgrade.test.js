'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parsePackageSpec } = require('../src/commands/upgrade');

// ---------------------------------------------------------------------------
// parsePackageSpec
// ---------------------------------------------------------------------------

test('parsePackageSpec: plain package name', () => {
  const { packageName, targetSpec } = parsePackageSpec('lodash');
  assert.equal(packageName, 'lodash');
  assert.equal(targetSpec, 'lodash');
});

test('parsePackageSpec: plain package with version', () => {
  const { packageName, targetSpec } = parsePackageSpec('lodash@4.17.21');
  assert.equal(packageName, 'lodash');
  assert.equal(targetSpec, 'lodash@4.17.21');
});

test('parsePackageSpec: scoped package without version', () => {
  const { packageName, targetSpec } = parsePackageSpec('@types/node');
  assert.equal(packageName, '@types/node');
  assert.equal(targetSpec, '@types/node');
});

test('parsePackageSpec: scoped package with version', () => {
  const { packageName, targetSpec } = parsePackageSpec('@types/node@18.0.0');
  assert.equal(packageName, '@types/node');
  assert.equal(targetSpec, '@types/node@18.0.0');
});

test('parsePackageSpec: package with pre-release version', () => {
  const { packageName, targetSpec } = parsePackageSpec('react@18.0.0-rc.0');
  assert.equal(packageName, 'react');
  assert.equal(targetSpec, 'react@18.0.0-rc.0');
});

test('parsePackageSpec: package with dist-tag', () => {
  const { packageName, targetSpec } = parsePackageSpec('lodash@latest');
  assert.equal(packageName, 'lodash');
  assert.equal(targetSpec, 'lodash@latest');
});
