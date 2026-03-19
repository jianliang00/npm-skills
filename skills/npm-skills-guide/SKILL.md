---
name: npm-skills-guide
description: >
  Guide for using auto-generated npm skills. Explains how skills generated
  from npm packages work, their structure, limitations, and how to invoke
  them correctly. Use this guide when working with any npm-* prefixed skill.
metadata:
  author: npm-skills
  version: "0.1.0"
  type: guide
---

# npm-skills Guide

This guide explains how to use skills that were automatically generated from
npm packages by the `npm-skills` tool.

## What are npm-generated Skills?

Skills whose names start with `npm-` in your agent's skills directory were
automatically generated from npm packages using `npm-skills add <package>`.
Each skill wraps a specific npm package and provides:

- Package description and purpose
- Installation instructions
- API usage examples
- Key capabilities

## How to Use npm-generated Skills

When working with an npm-generated skill:

1. **Follow the skill's own declaration.** Each npm skill's `SKILL.md` is the
   authoritative description of what the package does and how to call it.
   Always consult it before writing code.

2. **Packages are pre-installed globally.** npm-skills installs each package
   to `~/.npm-skills/packages/` so they are available from any directory.
   You can use them directly via `npm-skills run` and `npm-skills exec`.

3. **Use the package's actual public API.** The skill describes the npm
   package's public API. Use the standard `require()` / `import` patterns
   shown in the skill.

4. **Check the version.** Skills embed the version they were generated from.
   Ensure your project installs a compatible version.

## Running CLI Tools

If a package provides CLI commands, run them with `npm-skills run`:

```bash
npm-skills run <bin-name> [-- args...]
```

Example:

```bash
npm-skills run prettier -- --write src/
```

## Running JavaScript Code

Use `npm-skills exec` to run JavaScript that uses installed packages.
All installed packages are automatically available via `require()` or `import`.

Run inline code:

```bash
npm-skills exec -e "const _ = require('lodash'); console.log(_.VERSION);"
```

Run a script file:

```bash
npm-skills exec my-script.mjs
```

## Usage Principles

- Treat npm-generated skills as usage guides for specific npm packages.
- Do not assume functions exist without verifying against the skill description.
- When the skill lists specific CLI commands, those are the primary entry points.
- When the skill shows API imports, those are the intended usage patterns.
- If a function is not described in the skill, consult the package's own
  documentation before using it.

## Lifecycle Management

npm-generated skills are managed by the `npm-skills` CLI:

```bash
# Add a skill for an npm package (also installs it to ~/.npm-skills/packages/)
npx npm-skills add <package>

# Add a skill without installing the package (if already installed manually)
npx npm-skills add <package> --no-install

# Upgrade a skill to the package's latest version
npx npm-skills upgrade <package>

# Remove a skill (also uninstalls the package from ~/.npm-skills/packages/)
npx npm-skills remove <package>

# List all registered npm skills
npx npm-skills list
```

Skills and packages are stored globally in `~/.npm-skills/` and work from
any directory — no project-level setup required.
