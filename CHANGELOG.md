# Changelog

All notable changes to this project will be documented here.

## [0.1.0] - 2026-09-02

### Added
- Static detection for JavaScript/TypeScript and Python repositories.
- Detection for Node.js, Next.js, React, Vite, FastAPI, Flask, and Django from repository evidence.
- npm, pnpm, yarn, pip, Poetry, and uv package-manager detection.
- Detection of test, lint, format, build, development, install, and typecheck commands without fabricating missing scripts.
- Architecture hints for common top-level source directories.
- `AGENTS.md` and `.codex/` preview generation.
- Safe `--write`, `--dry-run`, and explicit `--force` behavior.
- Fixture-based tests and GitHub Actions CI.
