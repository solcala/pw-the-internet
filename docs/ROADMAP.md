# Implementation Roadmap

> **Status:** Batch 1 merged (`PR #1` — `feat/setup-infra`). **Next step: Batch 2 — Framework Core.**
>
> Each batch is a self-contained PR. Do not start the next batch until the current one is merged and green in CI.

---

## Implementation progress

**Last updated:** 2026-06-09 · **Branch:** `main` · **Latest merge:** `c860c57` (PR #1)

```text
Batch 1 ████████████████████░  ~95%  merged — minor gaps remain
Batch 2 ░░░░░░░░░░░░░░░░░░░░   0%   ← NEXT
Batch 3 ░░░░░░░░░░░░░░░░░░░░   0%
Batch 4 ██████░░░░░░░░░░░░░░  ~30%  container CI only (ad-hoc fix)
Batch 5–7 ░░░░░░░░░░░░░░░░░░░░   0%
```

| Batch | Status | PR / notes |
| --- | --- | --- |
| 1 | **~95% done — merged** | PR #1 `feat/setup-infra` — tooling, Husky, Docker scaffold, `.cursor/rules/` |
| 2 | **Not started** | **Next PR** — POM, fixtures injection, data migration |
| 3 | **Not started** | Blocked on Batch 2 — flat specs + `@smoke` / `@regression` tags |
| 4 | **Partial (~30%)** | `playwright.yml` uses Playwright Docker image (fixes Noble install error); full dual-gate pipeline pending |
| 5–7 | **Not started** | — |

### Batch 1 — remaining gaps (close before or during Batch 2)

- [x] Add `AGENTS.md` summarizing AI agent boundaries
- [ ] Update `README.md` — remove "migrating" / "initial draft" language; document dual-gate dev setup
- [ ] Verify exit criteria end-to-end: `npm run lint && npm run typecheck && npm test`

### Batch 4 — early work (not a substitute for full Batch 4 PR)

Done ad-hoc while fixing GitHub Actions:

- [x] `.github/workflows/playwright.yml` runs inside `mcr.microsoft.com/playwright:v1.59.1-noble`
- [x] Removed deprecated `microsoft/playwright-github-action@v1`

Still required in a dedicated Batch 4 PR (after Batch 3):

- [ ] Rename workflow → `ci.yml` with `lint → typecheck → test:smoke (PR) → test:ci (main)`
- [ ] Use `docker compose run --rm test-smoke` instead of bare `npx playwright test`
- [ ] Branch protection + failure artifacts (JUnit, traces)

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
| 1 | Infrastructure, hooks & AI standards | TS tooling, Husky, `.cursor/rules/` from day one | 1 PR | ~95% merged |
| 2 | Framework core | POM, fixtures, `test-tags.ts`, selector policy | 1 PR | **Next** |
| 3 | Migrate existing tests | Flat feature specs with `@smoke` / `@regression` tags | 1 PR | Not started |
| 4 | CI/CD, Docker & dual-gate | `--grep` suites in CI, blocking merge gates | 1 PR | ~30% |
| 5 | Coverage expansion | New features in single files with `test.describe` groups | 2–3 PRs | Not started |
| 6 | Visibility & metrics | GitHub Pages reports, PM-friendly dashboards | 1 PR | Not started |
| 7 | Engineering culture | ADRs, CODEOWNERS, onboarding, nightly `@regression` | 1 PR | Not started |

---

## Batch 1 — Infrastructure, Hooks & AI Standards

**Objective:** Establish the local quality foundation and AI governance **before** any framework or test migration work.

**Batch status:** ~95% complete — merged via PR #1 (`feat/setup-infra`). Minor gaps listed in [Implementation progress](#implementation-progress).

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
- [ ] Verify: commit is **blocked** when lint or typecheck fails

#### Gate 1 — Layer 0: AI standards from day one

- [x] Create `.cursor/rules/` with project conventions (read `CONTRIBUTING.md` before codegen) — 5 rule files tracked
- [x] Add `AGENTS.md` summarizing AI agent boundaries (audit only, never auto-commit)
- [x] Document local AI review prompt in `.cursor/rules/` (audit against `SELECTOR_POLICY.md`)
- [x] Ensure `CONTRIBUTING.md` §8–9 dual-gate workflow is the canonical reference
- [x] Add `.github/PULL_REQUEST_TEMPLATE.md` with Gate 1 / Gate 2 checklists

#### Documentation

- [ ] Update `README.md` with dev setup, dual-gate workflow, and link to `CONTRIBUTING.md` (partial — still references migration state)

### Batch 1 — Exit criteria

- `npm run lint && npm run typecheck && npm test` pass locally.
- Husky blocks commits with lint/type errors.
- `.cursor/rules/` exists — AI standards active from first line of framework code.
- Existing tests still pass (no behavior change yet).
- Tag-based npm scripts exist: `test:smoke` → `--grep @smoke`.

---

## Batch 2 — Framework Core

**Objective:** Build the reusable framework layer — page objects, fixtures, and the centralized tag system.

**Batch status:** **Not started — NEXT PR.** Scaffolding exists (`src/pages/the-internet/.gitkeep`, stub `src/fixtures/index.ts`) but no real POM or fixture injection yet. Legacy code still at `pages/` and `utils/`.

### Batch 2 — Checklist

#### Page objects & fixtures

- [ ] Create `src/pages/base.page.ts` (navigation, `goto`, `waitForLoaded`)
- [ ] Extend `src/fixtures/index.ts` — custom `test` export with page injection (currently stub re-export only)
- [ ] Create `src/fixtures/pages.fixture.ts` — inject page objects into test context
- [ ] Migrate `pages/add-remove-elements.page.ts` → `src/pages/the-internet/add-remove-elements.page.ts`
- [ ] Create `src/pages/the-internet/landing.page.ts`
- [ ] Migrate `utils/test-data.ts` → `src/data/navigation.map.ts`

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

- [ ] Export grep helpers or document tag usage pattern for specs and CI scripts
- [x] Wire `package.json` scripts to use tag constants (or consistent grep strings)

#### Standards documentation

- [x] Add `docs/SELECTOR_POLICY.md` (locator hierarchy — `getByRole` first) — completed in Batch 1
- [ ] Add first ADR: `docs/adr/0001-page-object-boundaries.md`
- [ ] Add ADR: `docs/adr/0002-tag-based-execution-over-folder-tiers.md`

### Batch 2 — Exit criteria

- Page objects live under `src/pages/the-internet/`.
- Fixtures inject pages — no `new PageObject(page)` in specs going forward.
- `src/config/test-tags.ts` is the single source of truth for `@smoke`, `@regression`, `@e2e`, `@flaky`.
- Selector policy documented and referenced in `.cursor/rules/`.

---

## Batch 3 — Migrate Existing Tests

**Objective:** Refactor current specs into flat, feature-based files with Playwright tags — zero behavior regression.

> **No tier folders.** Tests stay in `tests/` root as `{feature}.spec.ts`.

**Batch status:** **Not started — blocked on Batch 2.** Current state: `tests/smoke-internet.spec.ts` still exists; no `@smoke` / `@regression` tags; `tests/landing.spec.ts` imports `utils/test-data`; root `pages/` and `utils/` folders remain.

### Batch 3 — Checklist

#### Consolidate into feature files

- [ ] Refactor `tests/landing.spec.ts` — keep as `tests/landing.spec.ts` (flat, not moved to subfolder)
- [ ] Merge `tests/smoke-internet.spec.ts` → `tests/add-remove-elements.spec.ts` (rename + consolidate)
- [ ] Delete `tests/smoke-internet.spec.ts` after merge

#### Apply tags in test titles

- [ ] Add `@smoke` to critical-path tests (e.g. title loads, headings visible, core add/remove flow)
- [ ] Add `@regression` to extended scenarios (e.g. parameterized navigation links)
- [ ] Import `TAGS` from `src/config/test-tags.ts` where helpful for consistency

#### Refactor to framework patterns

- [x] Replace direct `@playwright/test` imports with `@fixtures` in `tests/landing.spec.ts` (partial — `smoke-internet.spec.ts` still uses `@playwright/test`)
- [ ] Use injected page objects (`landingPage`, `addRemoveElementsPage`)
- [ ] Remove `console.log` and legacy `utils/` imports
- [ ] Delete empty root `pages/` and `utils/` folders

#### Documentation cleanup

- [ ] Clean up `README.md` test coverage table: remove the temporary migration reference `(→ migrating to add-remove-elements.spec.ts)` and leave only the definitive `tests/add-remove-elements.spec.ts` filename.

#### Verify tag-based execution

- [ ] `npm run test:smoke` runs **only** `@smoke`-tagged tests (via `--grep`, not folders)
- [ ] `npm run test:regression` runs **only** `@regression`-tagged tests
- [ ] `npm test` runs the full suite across chromium, firefox, webkit
- [ ] Confirm `playwright.config.ts` has **no** folder-based `testMatch` for tiers

### Batch 3 — Exit criteria

- All specs are flat feature files under `tests/` (e.g. `landing.spec.ts`, `add-remove-elements.spec.ts`).
- No `tests/smoke/` or `tests/regression/` directories exist.
- `@smoke` subset completes in < 2 minutes locally.
- Test count unchanged — no lost coverage.
- Local AI review (Cursor) + Husky pre-commit pass on migrated files.

---

## Batch 4 — CI/CD, Docker & Dual-Gate

**Objective:** Remote Gate 2 — CI runs in Playwright Docker using `--grep` tag filters. Failed gates **block merge**.

**Batch status:** **Partial (~30%).** Docker files and local npm wrappers exist from Batch 1. GitHub Actions uses the Playwright container image (Noble fix) but runs the **full suite** — not yet the planned `lint → typecheck → test:smoke` dual-gate pipeline.

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

- [ ] Verify: `docker compose run test-smoke` matches local `npm run test:smoke`

#### GitHub Actions — tag-based CI (not folder-based)

- [ ] Rename workflow → `.github/workflows/ci.yml` (currently `playwright.yml`)
- [ ] Implement **blocking** CI stages:

  ```text
  lint → typecheck → test:smoke (PR) → test:ci (main)
  ```

- [x] Run tests inside official Playwright Docker image (`mcr.microsoft.com/playwright:v1.59.1-noble`) — ad-hoc fix for Noble `install-deps` failure
- [ ] PR pipeline: Run `@smoke` suite via `docker compose run --rm test-smoke` (currently runs full `npx playwright test`)
- [ ] Main pipeline: `npx playwright test --grep-invert @flaky` inside Docker
- [ ] Configure branch protection: **require CI pass to merge**
- [x] Browser install step removed — container image includes browsers (replaces deprecated `microsoft/playwright-github-action@v1`)

#### Dual-gate enforcement

- [x] Gate 1 (local): documented in PR template — Cursor AI review + Husky (Batch 1)
- [ ] Gate 2 (remote): CI lint + typecheck + Docker test run = **definitive merge gate**
- [x] Upload HTML report artifact on workflow completion (partial — no JUnit or traces yet)
- [ ] Add CI job summary table (pass/fail per browser) to PR checks

#### Update Documentation

- [ ] Update `README.md` and `CONTRIBUTING.md` with Docker commands (partial — README references Docker CI but migration state remains)
- [ ] Document CI grep mapping: PR = `@smoke`, main = invert `@flaky`, nightly = `@regression`

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

#### 5a — Dynamic Controls (PR 1)

- [ ] Create `src/pages/the-internet/dynamic-controls.page.ts`
- [ ] Create `tests/dynamic-controls.spec.ts` with structure:

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

- [ ] Register page in `src/fixtures/pages.fixture.ts`
- [ ] Run local Cursor AI review before commit

#### 5b — Challenging DOM (PR 2)

- [ ] Create `src/pages/the-internet/challenging-dom.page.ts`
- [ ] Create `tests/challenging-dom.spec.ts` with `test.describe` groups:
  - `test.describe('Button interactions', ...)` — `@smoke` happy paths
  - `test.describe('Table assertions', ...)` — `@regression` edge cases
  - `test.describe('Canvas rendering', ...)` — `@regression`
- [ ] Register page in fixtures

#### 5c — Navigation scale (PR 3)

- [ ] Expand `src/data/navigation.map.ts` with top 10 landing links
- [ ] Add navigation scenarios to `tests/landing.spec.ts` (same file — do not split)
- [ ] Tag critical link (`Add/Remove Elements`) `@smoke`; remaining links `@regression`
- [ ] Use parameterized `test.describe` loop over `NAVIGATION_MAP`

### Batch 5 — Exit criteria

- At least 5 page objects under `src/pages/the-internet/`.
- Every new feature = one spec file (e.g. `dynamic-controls.spec.ts`, not tier subfolders).
- Each file has ≥1 `@smoke` test and uses `test.describe` for positive/negative grouping.
- `npm run test:smoke` still completes in < 2 minutes.
- All new code passes Gate 1 (Cursor + Husky) and Gate 2 (CI Docker).

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

Architecture approved. Batch 1 merged (PR #1).

**Active gate — before starting Batch 2:**

1. Batch 1 exit criteria verified locally (`npm run lint && npm run typecheck && npm test`).
2. Close Batch 1 gaps: `AGENTS.md`, README dual-gate setup section.
3. Do not start Batch 3 until Batch 2 is merged and green in CI.
4. Reserve full Batch 4 dual-gate work for after Batch 3 (tags must exist before `--grep` CI has value).

**Next implementation target:** **Batch 2 — Framework Core** (single PR).
