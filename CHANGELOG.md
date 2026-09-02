# Changelog

All notable changes to this project will be documented here.

## [0.1.0] - 2026-09-02

### Added
- Static detection for JavaScript/TypeScript and Python repositories.
- Detection for Node.js, Next.js, React, Vite, FastAPI, Flask, and Django from repository evidence.
- npm, pnpm, yarn, pip, Poetry, and uv package-manager detection from lockfiles or explicit metadata.
- Detection of test, lint, format, build, development, install, and typecheck commands without fabricating missing scripts.
- Architecture hints for common top-level source directories.
- `AGENTS.md` and `.codex/` preview generation.
- Safe `--write`, `--dry-run`, and explicit `--force` behavior.
- Fixture-based tests, npm package dry-run validation, and GitHub Actions CI.
- Self-dogfood and preview-only dogfood against a real public repository.

### Safety
- Package-manager-specific commands are omitted when the package manager cannot be established from repository evidence.
- Python projects with only a generic `pyproject.toml` are no longer assumed to use pip.
- uv and Poetry tool commands are emitted through their project runners (`uv run` / `poetry run`) when those managers are detected.
