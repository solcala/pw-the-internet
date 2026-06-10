# pw-the-internet

[![CI](https://github.com/solcala/pw-the-internet/actions/workflows/ci.yml/badge.svg)](https://github.com/solcala/pw-the-internet/actions/workflows/ci.yml)

Playwright test automation suite for [The Internet](https://the-internet.herokuapp.com/) — a demo site commonly used for QA practice and portfolio projects.

## Stack

- [Playwright](https://playwright.dev/) Test
- TypeScript
- Page Object Model (POM)
- Tag-based execution (`@smoke`, `@regression`)
- Dual-gate quality (local AI + Husky + Docker CI)
- GitHub Actions CI

## Documentation

Start at **[docs/README.md](docs/README.md)** — documentation index with canonical sources per topic.

| Document | Description |
| --- | --- |
| [docs/README.md](docs/README.md) | **Index** — which file owns which rules |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Workflow, quality gates, PR process |
| [docs/SELECTOR_POLICY.md](docs/SELECTOR_POLICY.md) | **Canonical** locators, POM, sync policy |
| [docs/BLUEPRINT.md](docs/BLUEPRINT.md) | **Canonical** folder structure and layers |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Batch progress and checklist |
| [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md) | `@smoke` vs `@regression` for release decisions |
| [AGENTS.md](AGENTS.md) | AI entry point — links to canonical docs |

> **Current status:** Batch 7 complete (engineering culture). All roadmap batches implemented — see [docs/ROADMAP.md](docs/ROADMAP.md).

## Project structure

Approved layout per [docs/BLUEPRINT.md](docs/BLUEPRINT.md):

```text
tests/                          # Flat — one file per feature domain
├── landing.spec.ts             # @smoke / @regression in titles
├── add-remove-elements.spec.ts
├── dynamic-controls.spec.ts
└── challenging-dom.spec.ts

src/                            # Layered framework code
├── config/                     # environments.ts, test-tags.ts
├── fixtures/                   # custom test export + page injection
├── pages/the-internet/         # feature page objects
├── data/                       # navigation maps, builders, credentials
└── utils/reporters/            # metrics-reporter.ts (PM JSON)

docker/                         # Playwright Docker parity (Gate 1.3 + CI)
```

Execution tiers are **tags in test titles**, not subfolders — suites are filtered via `--grep @smoke` / `--grep @regression`. There are no `tests/smoke/` or `tests/regression/` directories.

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

Scenarios are grouped **by feature domain** in flat spec files. Tags in test titles control suite tiers — not folder structure.

| Spec | Tags | Coverage |
| --- | --- | --- |
| `tests/landing.spec.ts` | `@smoke`, `@regression` | Page title, headings (`@smoke`); 10 link navigations from `NAVIGATION_MAP` |
| `tests/add-remove-elements.spec.ts` | `@smoke` | Add, verify, and remove dynamic elements |
| `tests/dynamic-controls.spec.ts` | `@smoke`, `@regression` | Input enable/disable; checkbox show/hide (`test.describe` groups) |
| `tests/challenging-dom.spec.ts` | `@smoke`, `@regression` | Action button click (`@smoke`); table data and canvas (`@regression`) |

```bash
npm run test:smoke       # 7 scenarios × 3 browsers = 21 tests
npm run test:regression  # 13 scenarios × 3 browsers = 39 tests
npm test                 # 20 scenarios × 3 browsers = 60 tests
```

## CI

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — Gate 2 remote validation via Docker Compose (same commands as local pre-push).

| Event | Stages | Test filter | Docker service |
| --- | --- | --- | --- |
| **Pull request** | lint → typecheck → tests | `@smoke` | `test-smoke` |
| **Push to `main`** | lint → typecheck → tests | invert `@flaky` | `test-ci` |

Artifacts on every run: HTML report (`playwright-report/`), JUnit XML, metrics JSON. Traces uploaded on failure.

## Reports

```text
playwright-report/    # HTML — npm run report
reports/
├── junit/              # results.xml
└── metrics/            # summary.json (pass rate, by_browser, by_tag)
```

| Where | How to view |
| --- | --- |
| **Local / Docker** | Run tests, then `npm run report` |
| **CI** | Actions → **Artifacts** → download `playwright-report-*` |
| **GitHub Pages** | [`pages.yml`](.github/workflows/pages.yml) after each green `main` CI build |

`@regression` on demand: `npm run docker:test:regression`.

**Branch protection:** Import [`.github/rulesets/protect-main.json`](.github/rulesets/protect-main.json) — see [`.github/rulesets/README.md`](.github/rulesets/README.md).
