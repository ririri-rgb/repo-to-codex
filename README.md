# repo-to-codex

**Turn any repository into a Codex-ready repository in one command.**

```bash
npx repo-to-codex .
```

`repo-to-codex` statically inspects a repository and generates evidence-based instructions for AI coding agents. It finds the stack, package manager, verified project commands, common architecture directories, and relevant configuration without running the target repository's code.

## Why

Coding agents work best when a repository tells them how to install dependencies, test changes, lint, build, and navigate the codebase. Maintaining that context manually across repositories is repetitive and easy to get wrong. `repo-to-codex` turns repository evidence into a concise starting point.

## Features

- Detects JavaScript/TypeScript and Python repositories.
- Recognizes Node.js, Next.js, React, Vite, FastAPI, Flask, and Django.
- Detects npm, pnpm, yarn, pip, Poetry, and uv from lockfiles or explicit project metadata.
- Reads `package.json`, Python project files, lockfiles, and `Makefile` targets.
- Detects install/dev/test/lint/format/build/typecheck commands without inventing missing commands.
- Leaves package-manager-specific commands out when the package manager cannot be established from repository evidence.
- Describes common architecture directories using explicit evidence.
- Generates `AGENTS.md` plus `.codex/instructions.md`, `.codex/architecture.md`, and `.codex/commands.md`.
- Never executes commands from the analyzed repository.
- Preview-only by default.

## Quick Start

Node.js 20+ is required.

Run directly from npm:

```bash
npx repo-to-codex .
```

The default invocation only previews the files it would generate. To save them:

```bash
npx repo-to-codex . --write
```

Existing generated targets are protected. If `AGENTS.md` or one of the `.codex/` files already exists, `--write` stops instead of overwriting it. Review the preview first and use `--force` only when replacement is intentional.

```bash
npx repo-to-codex . --write --force
```

For local development from source:

```bash
git clone https://github.com/ririri-rgb/repo-to-codex.git
cd repo-to-codex
npm install
npm run build
npm link
repo-to-codex .
```

## Example

For a Next.js repository with matching scripts and an npm lockfile, output looks like:

```text
Analyzing repository...

✓ Detected TypeScript
✓ Detected Node.js
✓ Detected Next.js
✓ Detected React
✓ Detected npm
✓ Found test command
✓ Found lint command
✓ Found typecheck command
✓ Found build command

Generated preview:

  AGENTS.md
  .codex/instructions.md
  .codex/architecture.md
  .codex/commands.md

Run with --write to save files.
```

## Supported ecosystems

| Area | v0.1 support |
| --- | --- |
| Languages | JavaScript/TypeScript, Python |
| Frameworks/runtimes | Node.js, Next.js, React, Vite, FastAPI, Flask, Django |
| Package managers | npm, pnpm, yarn, pip, Poetry, uv |
| Test tools | Jest, Vitest, Playwright, pytest |
| Lint/format | ESLint, Prettier, Ruff, Black |
| Build evidence | package scripts, TypeScript, Vite, PEP 517, Makefile targets |

The detector architecture is intentionally modular so Go, Rust, and additional frameworks can be added without changing the generator contract.

## Generated files

- `AGENTS.md` — human-readable repository setup, commands, architecture, and agent guidelines.
- `.codex/instructions.md` — Codex-focused operating principles.
- `.codex/architecture.md` — detected structural hints and configuration files.
- `.codex/commands.md` — only commands supported by repository evidence.

## Safety

`repo-to-codex` is designed to inspect, not mutate, repositories unless explicitly requested.

- It does not execute detected install, test, lint, or build commands.
- The default mode writes nothing.
- `--write` refuses to overwrite any existing generated target.
- `--force` is required for intentional replacement.
- Unknown package managers or commands are omitted rather than guessed.
- Structural inspection is deliberately shallow and does not traverse dependency/build trees such as `.git`, `node_modules`, `dist`, `build`, `.next`, virtual environments, or coverage output.

## Contributing

Contributions are welcome, especially evidence-based detectors and fixture coverage. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Roadmap

Likely next steps are Go and Rust ecosystem detection, richer monorepo awareness, confidence/evidence reporting, and safer merge/update behavior for existing `AGENTS.md` files.

## License

MIT
