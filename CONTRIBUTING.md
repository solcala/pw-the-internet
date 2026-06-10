# Automation Methodology & Scaling Playbook

> This document is the engineering standard for `pw-the-internet` and serves as a **reusable blueprint** for establishing test automation culture on any project. It defines how we architect, write, review, ship, and measure Playwright tests.

---

## 1. Purpose & scope

### What this project demonstrates

| Capability | How we show it |
| --- | --- |
| **Technical depth** | Typed fixtures, POM boundaries, locator policy, Docker parity |
| **Scalability** | Layered `src/` framework, tag-based tiers (`@smoke` / `@regression`) |
| **Engineering culture** | CONTRIBUTING standards, ADRs, PR templates, AI review gates |
| **Stakeholder visibility** | GitHub Pages reports, PM-friendly metrics |
| **Maintainability** | One concern per file, no locator duplication, env-based config |

### Who this is for

- **Contributors** adding tests or page objects
- **Reviewers** evaluating PRs against defined standards
- **Tech leads** adopting this structure on other codebases
- **AI assistants** (Cursor, Copilot) generating code that fits our patterns

---

## 2. Architecture overview

Tests are organized **by feature, not by tier**. A single spec file owns every scenario for that feature — happy paths, edge cases, and negative flows live together so context is never split across files.

Execution tiers (`smoke`, `regression`, `e2e`) are controlled at runtime via **Playwright tags** in test titles and the `--grep` flag — not by folder structure.

```text
┌──────────────────────────────────────────────────────────────┐
│                         tests/                               │
│   landing.spec.ts          ← one file per feature            │
│   add-remove-elements.spec.ts                                │
│   dynamic-controls.spec.ts   (@smoke / @regression in titles) │
└────────────────────────────┬─────────────────────────────────┘
                             │ uses
┌────────────────────────────▼─────────────────────────────────┐
│                      src/fixtures/                           │
│   Injects page objects, data, config into test context       │
└────────────────────────────┬─────────────────────────────────┘
                             │ provides
┌────────────────────────────▼─────────────────────────────────┐
│                 src/pages/  +  src/data/                       │
│   UI encapsulation           Test data & builders            │
└────────────────────────────┬─────────────────────────────────┘
                             │ configured by
┌────────────────────────────▼─────────────────────────────────┐
│                      src/config/                             │
│   Environments, tag registry, grep presets, reporters        │
└──────────────────────────────────────────────────────────────┘
```

### Target `tests/` layout

```text
tests/
├── landing.spec.ts              # all landing scenarios
├── add-remove-elements.spec.ts  # smoke + regression in one file
├── dynamic-controls.spec.ts
└── login.spec.ts                # positive + negative flows together
```

### Why feature files over tier folders

| Approach | Problem |
| --- | --- |
| `tests/smoke/login.spec.ts` + `tests/regression/login.spec.ts` | Duplicated setup, split context, double maintenance |
| `tests/login.spec.ts` with `@smoke` / `@regression` tags | Single source of truth; tiers are a runtime filter |

Full directory layout: [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md)
Implementation plan: [`docs/ROADMAP.md`](docs/ROADMAP.md)

---

## 3. Coding standards

> **Canonical sources** — do not duplicate rules elsewhere. Index: [`docs/README.md`](docs/README.md).

| Topic | Canonical file |
| --- | --- |
| Locators, POM, sync policy | [`docs/SELECTOR_POLICY.md`](docs/SELECTOR_POLICY.md) |
| Folder layout, layers, naming | [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md) |
| Why POM / tags (decisions) | [`docs/adr/`](docs/adr/) |

### 3.1 Quick reference

```typescript
// Page object — locators + actions only
readonly addButton = this.page.getByRole('button', { name: 'Add Element' });

// Spec — assertions via fixtures
import { test, expect } from '@fixtures';

test('adds elements @smoke', async ({ addRemoveElementsPage }) => {
  await addRemoveElementsPage.open();
  await addRemoveElementsPage.addElements(3);
  await expect(addRemoveElementsPage.deleteButtons).toHaveCount(3);
});
```

Full locator hierarchy, POM rules, sync policy, and Gate 1.1 checklist: [`docs/SELECTOR_POLICY.md`](docs/SELECTOR_POLICY.md).

### 3.2 File naming

| Type | Pattern | Example |
| --- | --- | --- |
| Page object | `{feature}.page.ts` | `add-remove-elements.page.ts` |
| Component | `{name}.component.ts` | `footer.component.ts` |
| Test spec | `{feature}.spec.ts` | `login.spec.ts` |
| Fixture | `{concern}.fixture.ts` | `pages.fixture.ts` |

**One spec file per feature.** Tier is never encoded in the filename — it belongs in the test title as a tag.

```typescript
// tests/login.spec.ts — positive and negative scenarios in one file
import { test, expect } from '@fixtures';

test.describe('Login', () => {
  test('successful login with valid credentials @smoke', async ({ loginPage }) => {
    // critical path — runs on every PR
  });

  test('shows error message with invalid password @regression', async ({ loginPage }) => {
    // extended coverage — runs on main / nightly
  });

  test('rejects empty username and password @regression', async ({ loginPage }) => {
    // negative flow — same file, same page object, full context
  });
});
```

| Rule | Detail |
| --- | --- |
| Filename = feature domain | `dynamic-controls.spec.ts`, not `dynamic-controls.smoke.spec.ts` |
| Tag in title, not in path | `@smoke`, `@regression`, `@e2e` appended to `test()` title |
| `test.describe` groups scenarios | Mirror page/feature boundaries inside the file |
| Every feature file has ≥1 `@smoke` | Ensures PR pipeline always covers critical paths |

---

## 4. Test tiers & execution strategy

Tiers are **tags**, not folders. Playwright's `--grep` flag filters which tests run — the files on disk never change.

| Tier | Tag | Trigger | Target time |
| --- | --- | --- | --- |
| **Smoke** | `@smoke` | Every PR, pre-push hook | < 2 min |
| **Regression** | `@regression` | Merge to `main`, nightly | < 15 min |
| **E2E** | `@e2e` | Release branches, weekly | Variable |

A single feature file contributes tests to multiple tiers:

```text
tests/add-remove-elements.spec.ts
├── adds and removes elements @smoke          ← PR pipeline
├── handles rapid add/remove cycles @regression ← nightly
└── verifies button count after bulk delete @regression
```

### Tag conventions

| Tag | When to use | Example |
| --- | --- | --- |
| `@smoke` | Critical path, fast, high confidence | Landing loads, core CRUD |
| `@regression` | Extended coverage, edge cases, negative flows | Validation errors, async edge cases |
| `@e2e` | Multi-page journeys crossing features | Login → dashboard → logout |
| `@flaky` | Known unstable — excluded from CI grep | `test:ci` uses `--grep-invert @flaky` |

Tags are defined in `src/config/test-tags.ts` and referenced in specs and CI scripts to keep grep patterns in one place.

### npm scripts (target)

```json
{
  "scripts": {
    "test": "playwright test",
    "test:smoke": "playwright test --grep @smoke",
    "test:regression": "playwright test --grep @regression",
    "test:e2e": "playwright test --grep @e2e",
    "test:ci": "playwright test --grep-invert @flaky",
    "test:ui": "playwright test --ui",
    "report": "playwright show-report"
  }
}
```

```bash
npm test                  # Full suite — all tags, all features
npm run test:smoke        # Only tests whose title matches @smoke
npm run test:regression   # Only tests whose title matches @regression
npm run test:e2e          # Cross-feature journeys only
npm run test:ci           # Full suite minus @flaky (CI default on main)
npm run test:ui           # Playwright UI mode
npm run report            # Open HTML report
```

### CI grep mapping

| Pipeline stage | Command | Scope |
| --- | --- | --- |
| PR check | `npm run test:smoke` | `@smoke` only |
| Merge to `main` | `npm run test:ci` | all except `@flaky` |
| Nightly | `npm run test:regression` | `@regression` only |
| Release | `npm test` | everything |

### `playwright.config.ts` — no folder-based `testMatch`

```typescript
// ✅ DO: flat testDir, filter at runtime via --grep
export default defineConfig({
  testDir: './tests',
  // no testMatch per tier — tags handle it
});

// ❌ DON'T: split by directory
// testMatch: '**/smoke/**/*.spec.ts'
```

### Parallelism policy

| Environment | Workers | Retries | Trace | Grep |
| --- | --- | --- | --- | --- |
| Local | auto (50%) | 0 | on-first-retry | developer choice |
| CI (PR) | 1 | 1 | on-first-retry | `@smoke` |
| CI (main) | 2 | 2 | retain-on-failure | invert `@flaky` |
| CI (nightly) | 2 | 2 | retain-on-failure | `@regression` |

---

## 5. CI/CD & Docker parity

### Principle

> If it passes in Docker, it passes in CI. If it passes in CI, it passes on any developer machine.

### Docker workflow

```bash
# Build once
docker compose -f docker/docker-compose.yml build

# Run smoke (same as CI PR check)
docker compose -f docker/docker-compose.yml run --rm test-smoke

# Run full CI suite (same as CI main — invert @flaky)
docker compose -f docker/docker-compose.yml run --rm test-ci
```

### CI pipeline stages

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

```text
┌─────────────────────┐     ┌──────────────────────────────────────┐
│  lint (Docker)      │────►│  test (Docker)                       │
│  ESLint + typecheck │     │  PR  → test-smoke  (@smoke)          │
└─────────────────────┘     │  main → test-ci    (invert @flaky)   │
                            └──────────────────────────────────────┘
                                         │
                                         ▼
                              Artifacts: HTML, JUnit, traces (on failure)
```

### Branch protection — block merge until CI passes

The CI workflow alone does **not** block merges. Import the ruleset JSON once per repository:

**[`.github/rulesets/README.md`](.github/rulesets/README.md)** — `protect-main.json` import via GitHub UI or `gh api`.

### Artifact strategy

| Artifact | When | Retention | Consumer |
| --- | --- | --- | --- |
| HTML report | Every run | 30 days | Developers, GitHub Pages |
| JUnit XML | Every run | 30 days | CI dashboards, PR annotations |
| Traces | On failure | 7 days | Debugging |
| Metrics JSON | Every run | 90 days | PM dashboards |

---

## 6. Visibility & PM metrics

### GitHub Pages (HTML report)

- Workflow `pages.yml` publishes the latest `main` branch report.
- README badge links directly to the live report.
- PMs and stakeholders can browse pass/fail without installing anything.

### Metrics reporter (custom)

Each run produces `reports/metrics/summary.json`:

```json
{
  "timestamp": "2026-06-01T12:00:00Z",
  "duration_ms": 45000,
  "total": 60,
  "passed": 59,
  "failed": 1,
  "skipped": 0,
  "flaky": 0,
  "pass_rate": 0.983,
  "by_browser": {
    "chromium": { "passed": 20, "failed": 0, "skipped": 0, "duration_ms": 90000 },
    "firefox":  { "passed": 20, "failed": 0, "skipped": 0, "duration_ms": 95000 },
    "webkit":   { "passed": 19, "failed": 1, "skipped": 0, "duration_ms": 92000 }
  },
  "by_tag": {
    "@smoke": { "passed": 21, "failed": 0, "skipped": 0, "total": 21 },
    "@regression": { "passed": 38, "failed": 1, "skipped": 0, "total": 39 }
  }
}
```

| Field | Meaning |
| --- | --- |
| `pass_rate` | `passed / total` — headline health KPI |
| `by_browser` | Per-project breakdown (chromium, firefox, webkit) with durations |
| `by_tag` | Per-tag tier breakdown — use for smoke vs regression dashboards |
| `flaky` | Tests that passed after at least one retry |

Reporter: `src/utils/reporters/metrics-reporter.ts` · CI artifact retention: 90 days.

### PM-friendly KPIs

| Metric | Definition | Target |
| --- | --- | --- |
| **Pass rate** | passed / total | ≥ 98% |
| **Smoke duration** | Wall-clock for smoke tier | < 2 min |
| **Flaky rate** | tests that passed after retry / total | < 2% |
| **Coverage breadth** | Unique page objects with tests | Grow per batch |

### PR check summary

CI appends a markdown summary from `reports/metrics/summary.json` via `scripts/ci-test-summary.mjs`:

- Overall pass rate, flaky count, duration
- **By browser** — passed / failed / skipped per project
- **By tag** — `@smoke` vs `@regression` pass rate

See [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md) for how PMs and release owners should use these tiers.

---

## 7. Environment & secrets management

### Configuration layers

```text
.env.example          → Documents all variables (committed)
.env                  → Local overrides (gitignored)
CI secrets/vars       → GitHub Actions environment
src/config/environments.ts → Reads process.env with defaults
```

### Required variables

| Variable | Default | Description |
| --- | --- | --- |
| `BASE_URL` | `https://the-internet.herokuapp.com/` | Application under test |
| `CI` | `false` | Set by CI; adjusts workers/retries |
| `BASIC_AUTH_USER` | — | For `/basic_auth` scenarios |
| `BASIC_AUTH_PASS` | — | For `/basic_auth` scenarios |

### Rules

- Never commit `.env` or real credentials.
- Use `test.skip()` when required env vars are missing — don't fail silently.
- Document new variables in `.env.example` and this section.

---

## 8. AI-assisted development standards

AI accelerates authoring — it does **not** replace quality gates. All AI usage is **local and pre-commit**. Cursor audits code in the developer's workspace before anything reaches git. There is no remote AI reviewer in CI.

### 8.1 Scope: local only, pre-commit only

| Phase | AI role | Where it runs |
| --- | --- | --- |
| **Authoring** | Scaffold POMs, draft specs, explore DOM via MCP | Cursor — local workspace |
| **Local AI review** | Audit staged changes against standards | Cursor Agent — local workspace |
| **Pre-commit hook** | Lint + typecheck + AI artifact scan | Husky — local machine |
| **Pre-push hook** | Docker `@smoke` suite (mandatory) | Husky — `docker compose … test:smoke` |
| **CI/CD** | Run tests in Docker | GitHub Actions — remote |
| **Merge decision** | Human reviewer + green CI | GitHub PR |

> **Rule:** Never push code that has not passed the Local AI Review in Cursor first.

### 8.2 When to use AI (and when not to)

| Task | AI appropriate? | Gate |
| --- | --- | --- |
| Scaffold page object from MCP exploration | ✅ Yes | Local AI review |
| Generate test from acceptance criteria | ✅ Yes | Local AI review |
| Refactor to fixtures pattern | ✅ Yes | Local AI review |
| Audit locators against `SELECTOR_POLICY.md` | ✅ Yes — **Cursor Agent** | Local AI review (mandatory) |
| Choose locator strategy during authoring | ⚠️ Assisted | Human confirms in AI review |
| Modify CI/CD workflows | ⚠️ Assisted | Human + full CI run |
| `git commit` / `git push` | ❌ Never automated | Developer only |

### 8.3 MCP exploration workflow (authoring)

Use Playwright MCP inside Cursor to explore before writing code:

```text
1. MCP navigate → snapshot accessibility tree
2. Identify roles, names, DOM structure
3. Cursor drafts page object using getByRole (per SELECTOR_POLICY.md)
4. Developer writes spec in tests/{feature}.spec.ts with @smoke / @regression tags
5. → Proceed to Local AI Review (Section 9, Gate 1)
```

### 8.4 AI prompt conventions

When asking Cursor to generate or review code, include:

1. **Target page URL** and user flow
2. **Explicit reference:** `docs/SELECTOR_POLICY.md` — enforce `getByRole` hierarchy
3. **Fixture pattern:** use `@fixtures` import, not raw `@playwright/test`
4. **Tag tier:** `@smoke` or `@regression` in test title
5. **POM boundary:** no `expect()` inside page objects
6. **Review mode:** "audit only, do not commit" when running pre-commit review

**Example pre-commit review prompt:**

```text
Review my staged changes against CONTRIBUTING.md and docs/SELECTOR_POLICY.md.
Check: getByRole hierarchy, no assertions in POMs, correct @smoke/@regression tags,
@fixtures imports, no manual sync in POMs, no waitForTimeout. Report violations only — do not commit.
```

### 8.5 Local AI review checklist (Cursor Agent)

Run Gate 1.1 in Cursor **before every commit** using the checklist in [`docs/SELECTOR_POLICY.md`](docs/SELECTOR_POLICY.md) (Gate 1.1 section).

If Cursor flags violations → fix locally → re-run review → only then proceed to `git commit`.

### 8.6 Cursor agent conventions

Agent entry points: [`AGENTS.md`](AGENTS.md) · [`.cursor/rules/`](.cursor/rules/) · [`docs/README.md`](docs/README.md)

Agent-only constraints (audit only, no auto-commit, one batch per PR) live in `AGENTS.md`. Coding rules are **not** duplicated there — always read the canonical sources listed in §3.

### 8.7 AI velocity & token optimization

Track AI efficiency per batch to improve prompt quality and reduce token waste over time.

#### Local velocity log

Maintain a lightweight log at `docs/AI_VELOCITY_LOG.md`. Append one row per batch PR with session scores from the Meta-Prompt Evaluation below.

#### Optimization KPIs

| KPI | Target | How to measure |
| --- | --- | --- |
| **Prompt-to-Code Ratio** | < 3 prompts per feature | Count Cursor prompts needed to deliver one POM + spec file |
| **Refactor Rate** | Zero rewrites | No full file rewrites caused by missing context in the initial prompt |
| **Context Efficiency** | Always explicit `@file` refs | Every authoring prompt references `@CONTRIBUTING.md`, `@SELECTOR_POLICY.md`, or a source file |

If Refactor Rate > 0 for a batch, document the root cause in `AI_VELOCITY_LOG.md` and adjust the next session's prompts.

#### Pre-commit hook rule — AI artifact scan

Husky `pre-commit` scans **staged files** and **blocks the commit** if any of the following are detected:

| Blocked pattern | Example |
| --- | --- |
| AI placeholder comments | `// TODO: AI Generated`, `// FIXME: AI` |
| Unverified stubs | `// TODO: implement`, `pass`, `throw new Error('not implemented')` in test/POM files |
| Debug artifacts | `page.pause()`, `console.log(` in committed test code |
| Manual sync in POMs | `waitForLoaded()`, `locator.waitFor()`, `page.waitForTimeout()` in `src/pages/` |
| Selector policy violations | Raw CSS/XPath without `SELECTOR EXCEPTION:` comment |

This is Gate 1.2 enforcement — complementary to Gate 1.1 Cursor audit.

#### Meta-prompt evaluation workflow

At the **end of each Cursor session** (before opening a PR), run this exact prompt:

```text
Meta-Prompt Evaluation — analyze this chat session only.

Score each dimension 1–5 (5 = best):
1. Prompt Efficiency — how many prompts were needed vs. ideal (< 3 per feature)?
2. Context Management — were @file references used consistently?
3. Refactor Rate — were any files fully rewritten due to poor initial context? (5 = zero rewrites)

Output format:
- Prompt Efficiency:    _/5
- Context Management:   _/5
- Refactor Rate:        _/5
- Concrete optimization tip: one specific action to improve the next session

Do not generate code. Append results to docs/AI_VELOCITY_LOG.md.
```

Record the output in `docs/AI_VELOCITY_LOG.md` under the current batch row before pushing.

---

## 9. Dual-gate review process

Quality is enforced in two sequential gates. Gate 1 is entirely **local** (AI + git hooks). Gate 2 is **remote** (CI in Docker). A PR cannot merge until both gates pass.

```text
┌─────────────────────────────────────────────────────────────────┐
│  GATE 1 — LOCAL (Pre-Commit & Pre-Push)                         │
│                                                                 │
│  1.1  Cursor Agent AI Review   ← audit against SELECTOR_POLICY  │
│         ↓ (developer fixes issues)                              │
│  1.2  git commit → pre-commit  ← lint + typecheck on staged     │
│         ↓ (commit blocked if hook fails)                        │
│  1.3  git push → pre-push      ← Docker @smoke (mandatory)      │
│         ↓ (push blocked if smoke fails)                         │
│  open PR                                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  GATE 2 — REMOTE (CI/CD)                                        │
│                                                                 │
│  GitHub Actions → official Playwright Docker image              │
│  lint → typecheck → test:smoke (PR) / test:ci (main)           │
│         ↓                                                       │
│  Green CI = definitive validation → merge allowed               │
└─────────────────────────────────────────────────────────────────┘
```

### Gate 1 — Local (pre-commit & pre-push)

#### Step 1.1 — Local AI review (Cursor Agent)

**When:** After code is written, **before** `git commit`.
**Where:** Cursor IDE — local workspace only. Not CI. Not GitHub.

1. Stage your changes: `git add <files>`
2. Open Cursor Agent and run the pre-commit review prompt (see §8.4)
3. Cursor audits against:
   - `docs/SELECTOR_POLICY.md` — `getByRole` hierarchy, no fragile selectors
   - `CONTRIBUTING.md` §3 — no assertions in POMs, fixture imports, tag conventions
4. Fix every violation Cursor reports
5. Re-run review until clean

> Do not commit while Cursor reports open violations.

#### Step 1.2 — Pre-commit hook (Husky)

**When:** Automatically on `git commit`, after Step 1.1 AI review is complete.
**What runs:** `lint-staged` → `npm run lint` + `npm run typecheck` on staged files, plus AI artifact scan (see §8.7).

```bash
git commit -m "feat: add dynamic-controls coverage"
# Husky pre-commit triggers:
#   → eslint on staged .ts files
#   → tsc --noEmit
#   → AI artifact / placeholder scan
# Commit is BLOCKED if any step fails
```

#### Step 1.3 — Pre-push hook (Husky) — mandatory

**When:** Automatically on `git push`, after a successful commit.
**What runs:** The containerized smoke suite — **not optional**.

```bash
git push origin feat/my-branch
# Husky pre-push triggers:
docker compose -f docker/docker-compose.yml run --rm test:smoke
# Push is BLOCKED if @smoke tests fail
```

| Rule | Detail |
| --- | --- |
| **Mandatory** | Every `git push` runs the Docker smoke suite unless explicitly bypassed (see below) |
| **Command** | `docker compose -f docker/docker-compose.yml run --rm test:smoke` |
| **Scope** | Executes only `@smoke`-tagged tests via `--grep` inside the official Playwright Docker image |
| **Deterministic parity** | Running inside Docker eliminates local Node/OS/browser environment variations that cause false positives or false negatives on bare-metal `npm run test:smoke`. The pre-push environment matches the remote PR pipeline before code leaves the machine |
| **Zero false positives** | If pre-push passes in Docker, smoke failures on CI are caused by code — not by a divergent local setup |

##### **Emergency escape hatch**

If a developer faces an immediate real-world constraint (e.g., time-sensitive commuting, Docker daemon unavailable on a flight), they may bypass the pre-push hook with:

```bash
git push --no-verify
```

> **Strictly for exceptional cases.** `--no-verify` skips the mandatory Docker smoke gate. The developer accepts that Gate 2 CI may surface failures that pre-push would have caught. Do not use `--no-verify` as a default workflow.

### Gate 2 — Remote (CI/CD)

**When:** After a clean local commit is pushed and a PR is opened.
**Where:** GitHub Actions — [`.github/workflows/ci.yml`](.github/workflows/ci.yml) via Docker Compose (same services as local pre-push).

```text
PR opened
  → docker compose run --rm lint
  → docker compose run --rm test-smoke   # @smoke grep
  → upload artifacts (HTML, JUnit, traces on failure)

Push to main
  → docker compose run --rm lint
  → docker compose run --rm test-ci      # invert @flaky
```

CI is the **definitive validation gate**. It seals the automation quality loop — local gates catch issues early; CI proves parity across the containerized environment every teammate and pipeline shares.

### Branch naming

```text
batch-1/infrastructure
batch-3/migrate-existing-tests
feat/dynamic-controls
fix/flaky-add-remove-elements
```

### Human review priorities (PR)

After both gates are green, the human reviewer focuses on:

1. **Correctness** — does the test validate the intended behavior?
2. **Resilience** — will locators survive minor UI changes?
3. **Tier placement** — is `@smoke` used only for critical paths?
4. **Consistency** — does it match existing POM and fixture patterns?

### PR template

Copy into `.github/PULL_REQUEST_TEMPLATE.md` (or use as PR description):

```markdown
## Summary

- Implements batch ___ from `docs/ROADMAP.md` (if applicable)
- Feature / area: ___

## Gate 1 — Local (completed before push)

- [ ] Cursor Agent AI review passed (SELECTOR_POLICY + no assertions in POMs)
- [ ] `git commit` succeeded — Husky pre-commit (lint + typecheck) green
- [ ] `git push` succeeded — Husky pre-push Docker smoke (`test:smoke`) green, or `--no-verify` documented in PR notes

## Gate 2 — Remote (CI)

- [ ] GitHub Actions CI green on this PR
- [ ] Smoke suite (`@smoke`) passed inside Playwright Docker image
- [ ] No new lint / typecheck errors in CI

## Test changes

- [ ] New or updated spec: `tests/___ .spec.ts`
- [ ] Tags applied: `@smoke` / `@regression` in test titles
- [ ] Smoke suite still < 2 min

## Standards

- [ ] Locators follow `docs/SELECTOR_POLICY.md` (getByRole first)
- [ ] No assertions inside page objects
- [ ] `@fixtures` import used in specs
- [ ] Path aliases used (`@pages`, `@data`)

## Notes for reviewer

<!-- Anything non-obvious: flaky test context, env var requirements, etc. -->
```

---

## 10. Architecture Decision Records (ADRs)

Significant decisions are documented in `docs/adr/` — **why** a choice was made, not the full rule set. See [`docs/README.md`](docs/README.md).

```text
docs/adr/
├── 0001-page-object-boundaries.md
├── 0002-tag-based-execution-over-folder-tiers.md
└── template.md
```

### When to write an ADR

- Choosing fixture pattern over `beforeEach`
- Adding a new test tier or tag
- Changing CI parallelism strategy
- Adopting a new reporter or Docker base image

### ADR template

```markdown
# ADR-NNNN: Title

## Status
Proposed | Accepted | Deprecated

## Context
What is the issue?

## Decision
What did we decide?

## Consequences
What are the trade-offs?
```

---

## 11. Onboarding: your first test in 15 minutes

1. Clone repo, run `npm install && npx playwright install`
2. Read `docs/BLUEPRINT.md` (2 min)
3. Copy an existing smoke spec as template
4. Create page object in `src/pages/the-internet/`
5. Register page in `src/fixtures/pages.fixture.ts`
6. Write spec in `tests/{feature}.spec.ts` using `@fixtures` import and tags
7. Run `npm run test:smoke`
8. Open PR using the template

---

## 12. Scaling to other projects

This playbook is designed to be **copied, not forked**. To adopt on a new codebase:

1. Copy `docs/BLUEPRINT.md` → adjust `src/pages/{app-name}/`
2. Copy `CONTRIBUTING.md` → update env vars and URLs
3. Copy `docs/ROADMAP.md` → reset batch checklists
4. Implement Batch 1 (infra) first — always
5. Add Cursor rules pointing to your CONTRIBUTING

The folder structure, fixture pattern, test tiers, and CI stages remain identical. Only page objects and data change per application.

---

## 13. References

| Document | Purpose |
| --- | --- |
| [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md) | Target folder structure |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Batch implementation plan |
| [`docs/SELECTOR_POLICY.md`](docs/SELECTOR_POLICY.md) | Locator hierarchy — Gate 1.1 audit standard |
| [`docs/AI_VELOCITY_LOG.md`](docs/AI_VELOCITY_LOG.md) | Per-batch AI efficiency tracking (§8.7) |
| [`docs/TEST_STRATEGY.md`](docs/TEST_STRATEGY.md) | Tier definitions for stakeholders (Batch 6) |
| [Playwright Best Practices](https://playwright.dev/docs/best-practices) | Official reference |

---

*Last updated: architecture approved — tag-based, flat tests, dual-gate quality.*
