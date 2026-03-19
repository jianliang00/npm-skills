# npm-skills

Convert npm packages into installable AI agent skills that work with [Claude Code](https://claude.ai/code), [Codex](https://openai.com/codex), [Cursor](https://cursor.sh), and [40+ other agents](https://github.com/vercel-labs/skills#supported-agents).

## How it works

`npm-skills` wraps any npm package as a standard `SKILL.md` skill and registers it with every coding agent you have installed. It builds on the [vercel-labs/skills](https://github.com/vercel-labs/skills) ecosystem — the generated skills are plain `SKILL.md` files that any agent supporting that format can consume.

```
┌────────────────────┐        ┌──────────────────────┐
│   npm package      │──────▶│  SKILL.md generator  │
│  (lodash, axios …) │        │   (npm-skills add)   │
└────────────────────┘        └────────┬─────────────┘
                                       │ writes
                              .npm-skills/skills/<name>/SKILL.md
                                       │
                              ┌────────▼─────────────┐
                              │  skills CLI install  │
                              │  (npx skills add …)  │
                              └──────────────────────┘
```

On the **first `add`** npm-skills also registers **npm-skills-guide** — a meta-skill that teaches agents how to interpret and use auto-generated npm skills correctly.

## Installation

```bash
# Use once-off with npx (no global install needed)
npx npm-skills add lodash

# Or install globally
npm install -g npm-skills
npm-skills add lodash
```

## Commands

| Command | Description |
|---------|-------------|
| `npm-skills add <package>` | Generate and install a skill for an npm package |
| `npm-skills remove <package>` | Remove a skill and uninstall it from agents |
| `npm-skills upgrade <package[@version]>` | Upgrade a skill to the latest or a specified version |
| `npm-skills list` | List all registered npm skills |

## Examples

```bash
# Add lodash skill
npx npm-skills add lodash

# Add a specific version of a package
npx npm-skills add lodash@4.17.21

# Add a scoped package
npx npm-skills add @types/node

# Check what's installed
npx npm-skills list

# Upgrade to latest version
npx npm-skills upgrade lodash

# Upgrade to a specific version
npx npm-skills upgrade lodash@4.17.21

# Remove a skill
npx npm-skills remove lodash
```

## Output structure

Skills are written to `.npm-skills/skills/` in your project:

```
.npm-skills/
├── registry.json                     # tracks installed packages
└── skills/
    ├── npm-skills-guide/             # meta-skill (added automatically)
    │   └── SKILL.md
    └── npm-lodash/                   # generated from lodash
        └── SKILL.md
```

The generated skill name follows the convention `npm-<package-name>`, with scoped packages (`@org/name`) becoming `npm-org-name`.

## The npm-skills-guide skill

`npm-skills-guide` is a companion skill that explains to coding agents how to work with auto-generated npm skills. It is registered automatically the first time you run `npm-skills add`.

You can also install it independently from this repository:

```bash
npx skills add jianliang00/npm-skills --skill npm-skills-guide
```

## Architecture

The system has three layers:

1. **Standard SKILL.md format** — every generated skill and `npm-skills-guide` itself are plain `SKILL.md` files compatible with the vercel-labs/skills ecosystem.
2. **npm → skill generator** — `src/generator.js` converts npm package metadata (name, version, description, bin, exports, keywords) into a structured `SKILL.md`.
3. **Lifecycle management** — `npm-skills add / remove / upgrade` keeps generated skills in sync with their npm packages.

## Requirements

- Node.js ≥ 18.3.0

## License

Apache-2.0
