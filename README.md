# pw-the-internet

Playwright test automation suite for [The Internet](https://the-internet.herokuapp.com/) — a demo site commonly used for QA practice and portfolio projects.

## Stack

- [Playwright](https://playwright.dev/) Test
- TypeScript
- Page Object Model (POM)
- Tag-based execution (`@smoke`, `@regression`)
- Dual-gate quality (local AI + Husky + Docker CI)
- GitHub Actions CI

## Documentation

| Document | Description |
| --- | --- |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Methodology, quality gates & scaling playbook |
| [docs/BLUEPRINT.md](docs/BLUEPRINT.md) | Approved architecture — flat `tests/`, layered `src/` |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Batch-by-batch implementation plan |
| [docs/SELECTOR_POLICY.md](docs/SELECTOR_POLICY.md) | Locator hierarchy — Gate 1.1 audit standard |

> **Current status:** Initial draft committed. Full refactor follows the 7-batch roadmap — see docs before contributing.

## Project structure

**Current (migrating)** → **Target** per [docs/BLUEPRINT.md](docs/BLUEPRINT.md):

```text
Current                          Target
───────                          ──────
pages/                    →      src/pages/the-internet/
utils/                    →      src/data/
tests/*.spec.ts           →      tests/{feature}.spec.ts  (flat, tag-based)
playwright.config.ts      →      src/config/ + thin config
```

### Target layout (approved)

```text
tests/                          # Flat — one file per feature domain
├── landing.spec.ts             # @smoke / @regression tags in test titles
├── add-remove-elements.spec.ts
└── dynamic-controls.spec.ts    # (Batch 5)

src/                            # Layered framework code
├── config/                     # environments.ts, test-tags.ts
├── fixtures/                   # custom test export + page injection
├── pages/the-internet/         # feature page objects
└── data/                       # navigation maps, builders, credentials
```

Execution tiers are **tags in test titles**, not subfolders — suites are filtered via `--grep @smoke` / `--grep @regression`. There are no `tests/smoke/` or `tests/regression/` directories.

## Getting started

```bash
npm install
npx playwright install
```

## Running tests

```bash
# Full suite (chromium, firefox, webkit)
npm test

# Critical path only — @smoke tag
npm run test:smoke

# Extended coverage — @regression tag
npm run test:regression

# Playwright UI mode
npm run test:ui

# Open HTML report
npm run report
```

## Quality gates

This project enforces a **dual-gate** workflow — local checks before commit/push, containerized CI before merge.

| Gate | Step | What runs |
| --- | --- | --- |
| **Gate 1 — Local** | 1.1 Cursor audit | AI review against `SELECTOR_POLICY.md` + POM rules |
| | 1.2 Pre-commit (Husky) | Lint, typecheck, AI artifact scan on staged files |
| | 1.3 Pre-push (Husky) | `docker compose … run --rm test:smoke` — mandatory `@smoke` in Docker |
| **Gate 2 — Remote** | CI/CD | GitHub Actions in Playwright Docker — blocks merge on failure |

Full details, escape hatch (`git push --no-verify`), and PR checklist: [CONTRIBUTING.md §9](CONTRIBUTING.md).

## Test coverage

Scenarios are grouped **by feature domain** in flat spec files. Happy paths and negative/edge cases live in the same file, separated by `test.describe` blocks and tagged `@smoke` or `@regression`.

| Spec | Coverage |
| --- | --- |
| `tests/landing.spec.ts` | Page title, headings, link navigation |
| `tests/smoke-internet.spec.ts` | Add/Remove Elements — add, verify, remove (→ migrating to `add-remove-elements.spec.ts`) |

## CI

Tests run on push and pull requests to `main` / `master` via GitHub Actions. PRs execute `@smoke` via `--grep` inside the Playwright Docker image. The HTML report is uploaded as a workflow artifact.
