# Contributing to npm-skills

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your changes
4. Make your changes
5. Run the tests: `npm test`
6. Submit a pull request

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Each commit message should be structured as follows:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of the following:

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Changes that do not affect the meaning of the code (white-space, formatting, etc.) |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf` | A code change that improves performance |
| `test` | Adding missing tests or correcting existing tests |
| `chore` | Changes to the build process or auxiliary tools and libraries |
| `ci` | Changes to CI configuration files and scripts |

### Scope

Optional. A scope may be provided to indicate the section of the codebase affected (e.g., `generator`, `cli`, `registry`).

### Subject

- Use the imperative, present tense: "add" not "added" nor "adds"
- Do not capitalize the first letter
- No period (.) at the end

### Examples

```
feat(cli): add upgrade command
fix(generator): handle scoped package names correctly
docs: update installation instructions
test(registry): add tests for registry read/write
chore: update dependencies
```

## Code Style

- Follow the existing code style in the project
- Use meaningful variable and function names
- Add comments where the intent is not obvious

## Reporting Issues

- Use GitHub Issues to report bugs
- Include steps to reproduce the issue
- Include the expected and actual behavior

## License

By contributing to this project, you agree that your contributions will be licensed under the Apache License 2.0.
