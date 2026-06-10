# Architecture Blueprint

> **Status:** **Implemented and frozen** (Batch 7) — this document reflects the repo as built, not a future target.
>
> Tests are **flat and feature-based**. Execution tiers use Playwright tags (`@smoke`, `@regression`) and `--grep` — never subfolders.

---

## Design principles

| Principle | Rationale |
| --- | --- |
| **One file per feature** | All scenarios for a feature live in `tests/{feature}.spec.ts` — context is never split |
| **Tags, not folders** | `@smoke` / `@regression` in test titles; CI filters via `--grep` |
| **Separation of concerns** | Tests assert; page objects encapsulate UI; fixtures wire dependencies |
| **Dual-gate quality** | Gate 1: Cursor AI review + Husky → Gate 2: CI in Playwright Docker |
| **CI/local parity** | Same Docker Compose commands locally (pre-push) and in GitHub Actions |

Related docs: [`README.md`](../README.md) · [`ROADMAP.md`](ROADMAP.md) · [`SELECTOR_POLICY.md`](SELECTOR_POLICY.md) · [`CONTRIBUTING.md`](../CONTRIBUTING.md)

---

## Directory layout (as implemented)

```text
pw-the-internet/
│
├── .cursor/rules/                      # AI agent conventions
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                      # lint → @smoke (PR) / test-ci (main)
│   │   └── pages.yml                   # optional — HTML → GitHub Pages (public repos)
│   ├── rulesets/                       # Branch protection JSON + import guide
│   ├── CODEOWNERS                      # Ownership for src/ and tests/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .husky/
│   ├── pre-commit                      # lint + typecheck + AI artifact scan
│   └── pre-push                        # docker:test:smoke (Gate 1.3)
│
├── docker/
│   ├── Dockerfile                      # Pinned Playwright image
│   └── docker-compose.yml              # test-smoke, test-regression, test-ci, lint
│
├── docs/
│   ├── BLUEPRINT.md                    # This file
│   ├── ROADMAP.md
│   ├── SELECTOR_POLICY.md
│   ├── TEST_STRATEGY.md
│   ├── AI_VELOCITY_LOG.md
│   ├── README.md                       # Documentation index
│   └── adr/
│       ├── 0001-page-object-boundaries.md
│       ├── 0002-tag-based-execution-over-folder-tiers.md
│       └── template.md
│
├── scripts/
│   ├── check-ai-artifacts.sh           # Gate 1.1 — pre-commit scan
│   └── ci-test-summary.mjs             # CI job summaries from metrics JSON
│
├── src/
│   ├── config/
│   │   ├── environments.ts
│   │   └── test-tags.ts
│   ├── fixtures/
│   │   ├── index.ts
│   │   └── pages.fixture.ts
│   ├── pages/
│   │   ├── base.page.ts
│   │   └── the-internet/
│   │       ├── landing.page.ts
│   │       ├── add-remove-elements.page.ts
│   │       ├── dynamic-controls.page.ts
│   │       └── challenging-dom.page.ts
│   ├── data/
│   │   └── navigation.map.ts
│   └── utils/reporters/
│       └── metrics-reporter.ts
│
├── tests/                              # FLAT — one file per feature
│   ├── landing.spec.ts
│   ├── add-remove-elements.spec.ts
│   ├── dynamic-controls.spec.ts
│   └── challenging-dom.spec.ts
│
├── playwright-report/                  # Gitignored — Playwright HTML (npm run report)
├── reports/                            # Gitignored — junit + metrics
│   ├── junit/
│   └── metrics/
├── playwright.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── package.json
├── CONTRIBUTING.md
├── AGENTS.md
└── README.md
```

---

## `tests/` — flat, feature-based layout

| File | `test.describe` groups | Tags |
| --- | --- | --- |
| `landing.spec.ts` | Page content; link navigation (loop over `NAVIGATION_MAP`) | `@smoke`, `@regression` |
| `add-remove-elements.spec.ts` | Add/Remove Elements | `@smoke` |
| `dynamic-controls.spec.ts` | Input enable/disable; Checkbox visibility | `@smoke`, `@regression` |
| `challenging-dom.spec.ts` | Button interactions; Table assertions; Canvas rendering | `@smoke`, `@regression` |

### Execution — tags, not paths

| Command | Filter | When |
| --- | --- | --- |
| `npm run test:smoke` | `--grep @smoke` | PR CI, pre-push hook |
| `npm run test:regression` | `--grep @regression` | On demand (local / Docker) |
| `npm run test:ci` | `--grep-invert @flaky` | Main branch CI |
| `npm test` | none | Full local run |

Docker equivalents: `npm run docker:test:smoke`, `docker:test:regression`, `docker:test:ci`.

> **Forbidden:** `tests/smoke/`, `tests/regression/`, `tests/e2e/` as directory tiers.

---

## `src/` — layer layout

```text
src/
├── config/          Layer 1 — Environment & execution policy
├── fixtures/        Layer 2 — Dependency injection (page objects into test context)
├── pages/           Layer 3 — UI encapsulation (no assertions, no manual sync)
├── data/            Layer 4 — Navigation maps, static test data
└── utils/           Layer 5 — Cross-cutting helpers (metrics reporter)
```

### Layer rules

| Layer | Owns | Must not own |
| --- | --- | --- |
| `config/` | Env vars, tag constants, timeout defaults | Locators, test assertions |
| `fixtures/` | Wiring page objects into test context | Business logic |
| `pages/` | Locators (`readonly`) and user actions | `expect()` calls, manual sync |
| `data/` | Static maps (e.g. `navigation.map.ts`) | DOM interaction |
| `utils/` | Reporters | Feature-specific logic |
| `tests/` | Assertions, tags, `test.describe` grouping | Raw locators (use POM) |

---

## Path aliases (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "paths": {
      "@fixtures": ["./src/fixtures/index.ts"],
      "@pages/*": ["./src/pages/*"],
      "@data/*": ["./src/data/*"],
      "@config/*": ["./src/config/*"],
      "@utils/*": ["./src/utils/*"]
    }
  }
}
```

---

## CI pipelines

```text
Gate 1 (local)                     Gate 2 (CI / Docker)
─────────────────                  ─────────────────────
1.1 Cursor AI review               lint → typecheck
1.2 Husky pre-commit                    ↓
1.3 Husky pre-push                 @smoke (PR) / test-ci (main)
         ↓                              ↓
    open PR                        block merge on failure

On-demand regression               Pages (optional, public repos)
─────────────────                  ─────────────────────
docker:test:regression             playwright-report → GitHub Pages via pages.yml
```

---

## What we intentionally avoid

- **Tier subfolders** — `tests/smoke/`, `tests/regression/` duplicate files and split feature context
- **Tier suffixes in filenames** — `*.smoke.spec.ts` encodes execution intent in the path
- **Assertions in page objects** — failure messages belong in the spec layer
- **Manual sync in POMs** — use web-first `expect()` in specs (see ADR-0001)
- **Raw CSS / XPath** — forbidden unless DOM limitation requires it (inline `SELECTOR EXCEPTION` comment)
- **Hardcoded credentials** — env vars + `.env.example` only
- **Duplicated locators in specs** — belongs in a page object
- **God fixtures** — one fixture file per concern, merged in `index.ts`

---

## Adding a new feature (checklist)

1. `src/pages/the-internet/{feature}.page.ts`
2. Register in `src/fixtures/pages.fixture.ts`
3. `tests/{feature}.spec.ts` with `TAGS` in titles
4. `npm run lint && npm run typecheck && npm run docker:test:smoke`

Full walkthrough: [`CONTRIBUTING.md` §11](../CONTRIBUTING.md).
