# Contributing

Thanks for considering a contribution to `repo-to-codex`.

## Development

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

## Adding a detector

Keep detectors evidence-based: inspect repository files and configuration, return only facts that can be supported by those files, and never synthesize commands that are not present or directly implied by a lockfile/package-manager convention.

Add a small fixture under `test/fixtures/` and tests that cover both positive detection and non-detection where false positives are plausible.

## Pull requests

Keep changes focused, update documentation when behavior changes, and include tests for detection logic. Public behavior documented in the README must match implementation.
