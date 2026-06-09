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
| [AGENTS.md](AGENTS.md) | AI agent boundaries — audit only, never auto-commit |
| [docs/BLUEPRINT.md](docs/BLUEPRINT.md) | Approved architecture — flat `tests/`, layered `src/` |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Batch-by-batch implementation plan |
| [docs/SELECTOR_POLICY.md](docs/SELECTOR_POLICY.md) | Locator hierarchy — Gate 1.1 audit standard |

> **Current status:** Batch 1 complete (infrastructure, hooks, AI standards). Batch 2 (framework core) is next — see [docs/ROADMAP.md](docs/ROADMAP.md).

## Project structure

Approved layout per [docs/BLUEPRINT.md](docs/BLUEPRINT.md):

```text
tests/                          # Flat — one file per feature domain
├── landing.spec.ts
├── add-remove-elements.spec.ts # (Batch 3)
└── dynamic-controls.spec.ts    # (Batch 5)

src/                            # Layered framework code
├── config/                     # environments.ts, test-tags.ts
├── fixtures/                   # custom test export + page injection
├── pages/the-internet/         # feature page objects
└── data/                       # navigation maps, builders, credentials

docker/                         # Playwright Docker parity (Gate 1.3 + CI)
```

Execution tiers are **tags in test titles**, not subfolders — suites are filtered via `--grep @smoke` / `--grep @regression`. There are no `tests/smoke/` or `tests/regression/` directories.

Legacy paths (`pages/`, `utils/`) remain until Batch 2–3 migration.

## Getting started

```bash
npm install
cp .env.example .env   # optional — defaults work for the-internet.herokuapp.com
```

### Quality checks (Gate 1.2)

```bash
npm run lint
npm run typecheck
```

Husky runs lint-staged + typecheck + AI artifact scan on every `git commit`. Pre-push runs the Docker smoke suite (Gate 1.3).

### Running tests

**Docker-first** (recommended for gate validation — matches CI and pre-push):

```bash
npm run docker:test:smoke       # @smoke tag only
npm run docker:test:regression  # @regression tag only
npm run docker:test:ci          # full suite, excludes @flaky
npm run docker:lint             # lint + typecheck in container
```

**Local bare-metal** (requires browser install):

```bash
npx playwright install
npm test                        # full suite (chromium, firefox, webkit)
npm run test:smoke              # @smoke tag only
npm run test:regression         # @regression tag only
npm run test:ui                 # Playwright UI mode
npm run report                  # open HTML report
```

## Quality gates

This project enforces a **dual-gate** workflow — local checks before commit/push, containerized CI before merge.

| Gate | Step | What runs |
| --- | --- | --- |
| **Gate 1 — Local** | 1.1 Cursor audit | AI review against `SELECTOR_POLICY.md` + POM rules |
| | 1.2 Pre-commit (Husky) | Lint, typecheck, AI artifact scan on staged files |
| | 1.3 Pre-push (Husky) | `npm run docker:test:smoke` — mandatory `@smoke` in Docker |
| **Gate 2 — Remote** | CI/CD | GitHub Actions in Playwright Docker — blocks merge on failure |

Full details, escape hatch (`git push --no-verify`), and PR checklist: [CONTRIBUTING.md §9](CONTRIBUTING.md).

## Test coverage

Scenarios are grouped **by feature domain** in flat spec files. Happy paths and negative/edge cases live in the same file, separated by `test.describe` blocks and tagged `@smoke` or `@regression` (tags applied in Batch 3).

| Spec | Coverage |
| --- | --- |
| `tests/landing.spec.ts` | Page title, headings, link navigation |
| `tests/smoke-internet.spec.ts` | Add/Remove Elements — add, verify, remove |

## CI

Tests run on push and pull requests to `main` / `master` via GitHub Actions inside the official Playwright Docker image (`v1.59.1-noble`). The HTML report is uploaded as a workflow artifact.

Full dual-gate CI (`lint → typecheck → test:smoke` on PRs) is planned in Batch 4 — see [docs/ROADMAP.md](docs/ROADMAP.md).
