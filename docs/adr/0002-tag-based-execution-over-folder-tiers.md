# ADR-0002: Tag-Based Execution Over Folder Tiers

## Status

Accepted

## Context

Splitting tests into `tests/smoke/` and `tests/regression/` duplicates setup, splits feature context, and couples CI to folder paths instead of test intent.

## Decision

Use flat `tests/{feature}.spec.ts` files with `@smoke` / `@regression` tags in titles. Filter suites at runtime via `--grep` and `src/config/test-tags.ts`.

## Consequences

- Single file owns all scenarios for a feature
- Contributors must tag new tests; CI grep commands stay stable

## See also

- **Structure:** [`../BLUEPRINT.md`](../BLUEPRINT.md) — flat `tests/` layout
- **Tags:** `src/config/test-tags.ts` — `TAGS` constants and grep patterns
- **CI scripts:** `package.json` — `test:smoke`, `test:regression`, `test:ci`
