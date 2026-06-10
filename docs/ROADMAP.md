# Implementation Roadmap

> **Status:** Batch 5 **complete**. **Next step: Batch 6 — Visibility & PM Metrics.**
>
> Each batch is a self-contained PR. Do not start the next batch until the current one is merged and green in CI.

---

## Implementation progress

**Last updated:** 2026-06-10 · **Branch:** `feat/coverage-expansion`

```text
Batch 1 █████████████████████  100%  complete
Batch 2 █████████████████████  100%  complete
Batch 3 █████████████████████  100%  complete
Batch 4 █████████████████████  100%  complete
Batch 5 █████████████████████  100%  complete
Batch 6 ░░░░░░░░░░░░░░░░░░░░   0%   ← NEXT
Batch 7 ░░░░░░░░░░░░░░░░░░░░   0%
```

| Batch | Status | PR / notes |
| --- | --- | --- |
| 1 | **Complete** | PR #1 `feat/setup-infra` + `AGENTS.md` + README — exit criteria verified |
| 2 | **Complete** | POM, fixtures injection, `navigation.map.ts`, ADRs — 12/12 Docker CI pass |
| 3 | **Complete** | Tagged specs, `add-remove-elements.spec.ts`, smoke/regression grep verified |
| 4 | **Complete** | `ci.yml` dual-gate — lint → Docker smoke (PR) / test-ci (main) |
| 5 | **Complete** | dynamic-controls, challenging-dom, navigation scale — 60/60 Docker CI pass |
| 6–7 | **Not started** | — |

### Batch 4 — exit verification

- [x] `.github/workflows/ci.yml` — lint job + test job via `docker compose`
- [x] PR pipeline: `test-smoke` (`@smoke` grep)
- [x] Main pipeline: `test-ci` (invert `@flaky`)
- [x] Artifacts: HTML, JUnit; traces on failure
- [x] Job summaries in GitHub Actions
- [x] Branch protection — `.github/rulesets/protect-main.json` (import via UI or `gh api`)
- [x] `playwright.config.ts` — `github` + `junit` reporters in CI

---

## Architectural pillars

These decisions are **non-negotiable** across every batch:

| Pillar | Rule |
| --- | --- |
| **Feature files, not tier folders** | One `tests/{feature}.spec.ts` per feature — never `tests/smoke/` or `tests/regression/` |
| **Tag-based execution** | `@smoke`, `@regression`, `@e2e` in test titles; suites filtered via `--grep` |
| **Centralized tags** | Tag constants live in `src/config/test-tags.ts` |
| **Dual-gate quality** | Gate 1: local Cursor AI review + Husky hooks → Gate 2: CI in Playwright Docker |
| **POM boundaries** | Actions in page objects; assertions in specs only |

Full standards: [`CONTRIBUTING.md`](../CONTRIBUTING.md) · Structure: [`BLUEPRINT.md`](BLUEPRINT.md)

---

## Overview

```text
Batch 1 ──► Batch 2 ──► Batch 3 ──► Batch 4 ──► Batch 5 ──► Batch 6 ──► Batch 7
 Infra+AI    Framework    Migrate      CI/CD       Coverage    Visibility   Culture
```

| Batch | Name | Goal | Est. effort | Progress |
| --- | --- | --- | --- | --- |
| 1 | Infrastructure, hooks & AI standards | TS tooling, Husky, `.cursor/rules/` from day one | 1 PR | **Complete** |
| 2 | Framework core | POM, fixtures, `test-tags.ts`, selector policy | 1 PR | **Complete** |
| 3 | Migrate existing tests | Flat feature specs with `@smoke` / `@regression` tags | 1 PR | **Complete** |
| 4 | CI/CD, Docker & dual-gate | `--grep` suites in CI, blocking merge gates | 1 PR | **Complete** |
| 5 | Coverage expansion | New features in single files with `test.describe` groups | 2–3 PRs | **Complete** |
| 6 | Visibility & metrics | GitHub Pages reports, PM-friendly dashboards | 1 PR | **Next** |
| 7 | Engineering culture | ADRs, CODEOWNERS, onboarding, nightly `@regression` | 1 PR | Not started |

---

## Batch 1 — Infrastructure, Hooks & AI Standards

**Objective:** Establish the local quality foundation and AI governance **before** any framework or test migration work.

**Batch status:** **Complete.** Merged via PR #1 (`feat/setup-infra`); closed with `AGENTS.md`, README update, and exit-criteria verification.

### Batch 1 — Checklist

#### Tooling & environment

- [x] Add `tsconfig.json` with strict mode and path aliases (`@pages`, `@fixtures`, `@data`, `@config`)
- [x] Add ESLint (`@typescript-eslint` + Playwright plugin)
- [x] Add Prettier with shared config
- [x] Create `src/` directory scaffold
- [x] Create `.env.example` documenting `BASE_URL`, `CI`, auth credentials
- [x] Split environment config into `src/config/environments.ts`
- [x] Refactor `playwright.config.ts` to import from `src/config/` (flat `testDir: './tests'` — no tier folders)
- [x] Add npm scripts: `lint`, `format`, `typecheck`, `test:smoke`, `test:regression`, `test:ci`

#### Gate 1 — Layer 1: Husky + lint-staged (local git hooks)

- [x] Add Husky with `pre-commit` hook
- [x] Configure lint-staged: ESLint + Prettier on staged `.ts` files
- [x] Pre-commit runs `npm run typecheck` on staged changes
- [x] Gate 1.3: Add mandatory Husky `pre-push` hook running the containerized smoke suite (`docker compose -f docker/docker-compose.yml run --rm test-smoke`) with documented escape hatch
- [x] Verify: commit is **blocked** when lint or typecheck fails (Husky pre-commit: lint-staged + typecheck)

#### Gate 1 — Layer 0: AI standards from day one

- [x] Create `.cursor/rules/` with project conventions (read `CONTRIBUTING.md` before codegen) — 5 rule files tracked
- [x] Add `AGENTS.md` summarizing AI agent boundaries (audit only, never auto-commit)
- [x] Document local AI review prompt in `.cursor/rules/` (audit against `SELECTOR_POLICY.md`)
- [x] Ensure `CONTRIBUTING.md` §8–9 dual-gate workflow is the canonical reference
- [x] Add `.github/PULL_REQUEST_TEMPLATE.md` with Gate 1 / Gate 2 checklists

#### Documentation

- [x] Update `README.md` with dev setup, dual-gate workflow, and link to `CONTRIBUTING.md`

### Batch 1 — Exit criteria

- `npm run lint && npm run typecheck && npm test` pass locally.
- Husky blocks commits with lint/type errors.
- `.cursor/rules/` exists — AI standards active from first line of framework code.
- Existing tests still pass (no behavior change yet).
- Tag-based npm scripts exist: `test:smoke` → `--grep @smoke`.

---

## Batch 2 — Framework Core

**Objective:** Build the reusable framework layer — page objects, fixtures, and the centralized tag system.

**Batch status:** **Complete.** Exit criteria verified — `npm run lint && npm run typecheck && npm run docker:test:ci` (12/12 pass).

### Batch 2 — Checklist

#### Page objects & fixtures

- [x] Create `src/pages/base.page.ts` (navigation, `goto` — no manual sync per ADR-0001)
- [x] Extend `src/fixtures/index.ts` — custom `test` export with page injection
- [x] Create `src/fixtures/pages.fixture.ts` — inject page objects into test context
- [x] Migrate `pages/add-remove-elements.page.ts` → `src/pages/the-internet/add-remove-elements.page.ts`
- [x] Create `src/pages/the-internet/landing.page.ts`
- [x] Migrate `utils/test-data.ts` → `src/data/navigation.map.ts`

#### Centralized tag system

- [x] Create `src/config/test-tags.ts` (completed early in Batch 1):

  ```typescript
  export const TAGS = {
    SMOKE: '@smoke',
    REGRESSION: '@regression',
    E2E: '@e2e',
    FLAKY: '@flaky',
  } as const;
  ```

- [x] Export grep helpers or document tag usage pattern for specs and CI scripts (`grepPatterns` + JSDoc in `test-tags.ts`)
- [x] Wire `package.json` scripts to use tag constants (or consistent grep strings)

#### Standards documentation

- [x] Add `docs/SELECTOR_POLICY.md` (locator hierarchy — `getByRole` first) — completed in Batch 1
- [x] Add first ADR: `docs/adr/0001-page-object-boundaries.md`
- [x] Add ADR: `docs/adr/0002-tag-based-execution-over-folder-tiers.md`

### Batch 2 — Exit criteria

- Page objects live under `src/pages/the-internet/`.
- Fixtures inject pages — no `new PageObject(page)` in specs going forward.
- `src/config/test-tags.ts` is the single source of truth for `@smoke`, `@regression`, `@e2e`, `@flaky`.
- Selector policy documented and referenced in `.cursor/rules/`.

---

## Batch 3 — Migrate Existing Tests

**Objective:** Refactor current specs into flat, feature-based files with Playwright tags — zero behavior regression.

> **No tier folders.** Tests stay in `tests/` root as `{feature}.spec.ts`.

**Batch status:** **Complete.** Exit criteria verified — tag grep suites and full CI pass in Docker.

### Batch 3 — Checklist

#### Consolidate into feature files

- [x] Refactor `tests/landing.spec.ts` — keep as `tests/landing.spec.ts` (flat, not moved to subfolder)
- [x] Merge `tests/smoke-internet.spec.ts` → `tests/add-remove-elements.spec.ts` (rename + consolidate)
- [x] Delete `tests/smoke-internet.spec.ts` after merge

#### Apply tags in test titles

- [x] Add `@smoke` to critical-path tests (e.g. title loads, headings visible, core add/remove flow)
- [x] Add `@regression` to extended scenarios (e.g. parameterized navigation links)
- [x] Import `TAGS` from `src/config/test-tags.ts` where helpful for consistency

#### Refactor to framework patterns

- [x] Replace direct `@playwright/test` imports with `@fixtures` (both specs)
- [x] Use injected page objects (`landingPage`, `addRemoveElementsPage`)
- [x] Remove legacy `utils/` imports (`@data/navigation.map`)
- [x] Delete empty root `pages/` and `utils/` folders

#### Documentation cleanup

- [x] Clean up `README.md` test coverage table with definitive spec filenames and tag breakdown

#### Verify tag-based execution

- [x] `npm run test:smoke` runs **only** `@smoke`-tagged tests (via `--grep`, not folders)
- [x] `npm run test:regression` runs **only** `@regression`-tagged tests
- [x] `npm test` runs the full suite across chromium, firefox, webkit
- [x] Confirm `playwright.config.ts` has **no** folder-based `testMatch` for tiers

### Batch 3 — Exit criteria

- All specs are flat feature files under `tests/` (e.g. `landing.spec.ts`, `add-remove-elements.spec.ts`).
- No `tests/smoke/` or `tests/regression/` directories exist.
- `@smoke` subset completes in < 2 minutes locally.
- Test count unchanged — no lost coverage.
- Local AI review (Cursor) + Husky pre-commit pass on migrated files.

---

## Batch 4 — CI/CD, Docker & Dual-Gate

**Objective:** Remote Gate 2 — CI runs in Playwright Docker using `--grep` tag filters. Failed gates **block merge**.

**Batch status:** **Complete.** Gate 2 enforced via `.github/workflows/ci.yml` — Docker Compose parity with local pre-push.

### Batch 4 — Checklist

#### Docker parity

- [x] Create `docker/Dockerfile` pinned to Playwright version in `package.json`
- [x] Create `docker/docker-compose.yml` with services:

  ```yaml
  # test-smoke      → npm run test:smoke
  # test-ci         → npm run test:ci
  # test-regression → npm run test:regression
  # lint            → npm run lint && npm run typecheck
  ```

- [x] Verify: `docker compose run test-smoke` matches local `npm run test:smoke`

#### GitHub Actions — tag-based CI (not folder-based)

- [x] Rename workflow → `.github/workflows/ci.yml` (removed `playwright.yml`)
- [x] Implement **blocking** CI stages:

  ```text
  lint → typecheck → test:smoke (PR) → test:ci (main)
  ```

- [x] PR pipeline: `docker compose run --rm test-smoke` (`@smoke` grep)
- [x] Main pipeline: `docker compose run --rm test-ci` (invert `@flaky`)
- [x] Branch protection — `.github/rulesets/protect-main.json` + README import steps
- [x] Tests run inside Playwright Docker image via `docker/Dockerfile` (Compose build)

#### Dual-gate enforcement

- [x] Gate 1 (local): documented in PR template — Cursor AI review + Husky (Batch 1)
- [x] Gate 2 (remote): CI lint + typecheck + Docker test run = **definitive merge gate**
- [x] Upload artifacts: HTML report, JUnit XML; traces on failure
- [x] CI job summaries in GitHub Actions step summary

#### Update Documentation

- [x] Update `README.md` and `CONTRIBUTING.md` with CI pipeline and Docker commands
- [x] Document CI grep mapping: PR = `@smoke`, main = invert `@flaky`, nightly = `@regression`

### Batch 4 — Exit criteria

- PR cannot merge unless lint, typecheck, and `@smoke` Docker run pass.
- `docker compose run test:smoke` exit code matches local `npm run test:smoke`.
- No CI step references `tests/smoke/` or `tests/regression/` paths.
- Failed CI uploads trace artifacts for debugging.

---

## Batch 5 — Coverage Expansion

**Objective:** Add high-value features using the established patterns — **one file per feature**, `test.describe` for scenario groups.

> Positive (happy path) and negative (edge cases) scenarios live in the **same file**, separated by `test.describe` blocks and tagged appropriately.

### Batch 5 — Checklist

**Batch status:** **Complete.** Branch `feat/coverage-expansion` — lint, typecheck, Docker smoke/regression/ci verified.

#### 5a — Dynamic Controls (PR 1)

- [x] Create `src/pages/the-internet/dynamic-controls.page.ts`
- [x] Create `tests/dynamic-controls.spec.ts` with structure:

  ```typescript
  test.describe('Dynamic Controls', () => {
    test.describe('Input enable/disable', () => {
      test('enables input after remove @smoke', ...);
      test('disables input on add @regression', ...);
    });
    test.describe('Checkbox visibility', () => {
      test('shows checkbox after enable @smoke', ...);
      test('hides checkbox after remove @regression', ...);
    });
  });
  ```

- [x] Register page in `src/fixtures/pages.fixture.ts`
- [x] Run local Cursor AI review before commit

#### 5b — Challenging DOM (PR 2)

- [x] Create `src/pages/the-internet/challenging-dom.page.ts`
- [x] Create `tests/challenging-dom.spec.ts` with `test.describe` groups:
  - `test.describe('Button interactions', ...)` — `@smoke` happy paths
  - `test.describe('Table assertions', ...)` — `@regression` edge cases
  - `test.describe('Canvas rendering', ...)` — `@regression`
- [x] Register page in fixtures

#### 5c — Navigation scale (PR 3)

- [x] Expand `src/data/navigation.map.ts` with top 10 landing links
- [x] Add navigation scenarios to `tests/landing.spec.ts` (same file — do not split)
- [x] Tag critical link (`Add/Remove Elements`) `@smoke`; remaining links `@regression`
- [x] Use parameterized `test.describe` loop over `NAVIGATION_MAP`

### Batch 5 — Exit criteria

- [x] Four feature page objects under `src/pages/the-internet/` (landing, add-remove-elements, dynamic-controls, challenging-dom).
- [x] Every new feature = one spec file (e.g. `dynamic-controls.spec.ts`, not tier subfolders).
- [x] Each file has ≥1 `@smoke` test and uses `test.describe` for positive/negative grouping.
- [x] `npm run test:smoke` still completes in < 2 minutes (~1.8 min Docker).
- [x] All new code passes Gate 1 (Cursor + Husky) and Gate 2 (CI Docker).

### Batch 5 — Exit verification

- [x] `npm run lint` + `npm run typecheck` — pass
- [x] `npm run docker:test:smoke` — 21 passed
- [x] `npm run docker:test:regression` — 39 passed
- [x] `npm run docker:test:ci` — 60 passed

---

## Batch 6 — Visibility & PM Metrics

**Objective:** Make tag-filtered test results visible to technical and non-technical stakeholders.

### Batch 6 — Checklist

- [ ] Add custom reporter `src/utils/reporters/metrics-reporter.ts` (pass/fail/skip/duration/tags JSON)
- [ ] Configure multi-reporter: HTML + JUnit + metrics JSON
- [ ] Create `.github/workflows/pages.yml` — publish HTML report to GitHub Pages on `main`
- [ ] Add README badges (CI status + Pages link)
- [ ] Create `docs/TEST_STRATEGY.md` — explain `@smoke` vs `@regression` for release decisions
- [ ] CI job summary: pass rate broken down by tag tier
- [ ] Document PM metrics format in `CONTRIBUTING.md`

### Batch 6 — Exit criteria

- Every `main` build publishes a browsable HTML report.
- PR checks show human-readable pass/fail summary per browser.
- Metrics JSON includes tag breakdown (`@smoke`, `@regression`).

---

## Batch 7 — Engineering Culture

**Objective:** Codify long-term maintainability — ADRs, ownership, onboarding, scheduled regression.

> AI standards and `.cursor/rules/` are already live from Batch 1. This batch focuses on team scale.

### Batch 7 — Checklist

- [ ] Add `docs/adr/template.md` and document ADR process in `CONTRIBUTING.md`
- [ ] Add `.github/CODEOWNERS` for `src/` and `tests/`
- [ ] Create `.github/workflows/nightly.yml` — `npx playwright test --grep @regression` in Docker
- [ ] Finalize onboarding section in `CONTRIBUTING.md` §11 (15-minute first test guide)
- [ ] Review and freeze `docs/BLUEPRINT.md` to match implemented structure
- [ ] Optional: flaky test detection job (retry analysis on nightly results)

### Batch 7 — Exit criteria

- A new developer can add a tagged test by reading `CONTRIBUTING.md` only.
- ADR process is defined for architectural changes.
- Nightly `@regression` suite runs on schedule in Docker.
- `BLUEPRINT.md` reflects the implemented (not proposed) structure.

---

## Dependency graph

```text
Batch 1 (Infra + AI + Husky)
    │
    ▼
Batch 2 (Framework + test-tags.ts)
    │
    ▼
Batch 3 (Migrate → flat feature files + tags)
    │
    ▼
Batch 4 (CI/Docker + dual-gate) ──► Gate 2 enforced
    │
    ▼
Batch 5 (Coverage — single files + test.describe)
    │
    ├──────────────────┐
    ▼                  ▼
Batch 6 (Visibility)   Batch 7 (Culture + nightly @regression)
```

> Execute batches **sequentially** unless explicitly noted. Batch 5 requires Batch 4 (CI must validate new tests on merge).

---

## Dual-gate quick reference

| Gate | Where | What | Blocks |
| --- | --- | --- | --- |
| **1.1** | Cursor (local) | AI audit vs `SELECTOR_POLICY.md` + POM rules | Commit (developer choice) |
| **1.2** | Husky (local) | `lint` + `typecheck` on staged files | `git commit` |
| **2** | GitHub Actions (Docker) | `lint` → `typecheck` → `--grep @smoke` | **PR merge** |

---

## Approval gate

Architecture approved. **Batches 1–5 complete.**

**Active gate — before starting Batch 6:**

1. Batch 5 merged and green in CI.
2. Smoke suite remains under 2 minutes on PR checks.

**Next implementation target:** **Batch 6 — Visibility & PM Metrics** (`metrics-reporter.ts`, GitHub Pages).
