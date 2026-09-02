# Security Policy

## Reporting a vulnerability

Please do not open a public issue for a suspected security vulnerability. Use GitHub's private vulnerability reporting feature for this repository when available.

Include the affected version, reproduction steps, impact, and any suggested mitigation. Maintainers will assess reports and coordinate a fix and disclosure as appropriate.

## Safety model

`repo-to-codex` performs static repository inspection. It does not execute detected project commands. By default it does not write files. `--write` refuses to overwrite existing generated targets unless the user also passes `--force`.
