# Target Architecture Blueprint

> **Status:** Approved — single source of truth for project structure.
>
> Tests are **flat and feature-based**. Execution tiers are controlled by Playwright tags (`@smoke`, `@regression`) and `--grep` — never by subfolders.

---

## Design principles

| Principle | Rationale |
| --- | --- |
| **One file per feature** | All scenarios for a feature live in `tests/{feature}.spec.ts` — context is never split |
| **Tags, not folders** | `@smoke` / `@regression` in test titles; CI filters via `--grep` |
| **Separation of concerns** | Tests assert; page objects encapsulate UI; fixtures wire dependencies |
| **Dual-gate quality** | Gate 1: Cursor AI review + Husky → Gate 2: CI in Playwright Docker |
| **CI/local parity** | Same commands inside Docker and on the developer machine |

Related docs: [`ROADMAP.md`](ROADMAP.md) · [`SELECTOR_POLICY.md`](SELECTOR_POLICY.md) · [`CONTRIBUTING.md`](../CONTRIBUTING.md)

---

## Full directory layout

```text
pw-the-internet/
│
├── .cursor/
│   └── rules/                          # AI agent conventions (Batch 1)
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                      # lint → typecheck → --grep @smoke (PR)
│   │   ├── nightly.yml                 # --grep @regression (scheduled)
│   │   └── pages.yml                   # Publish HTML report to GitHub Pages
│   ├── PULL_REQUEST_TEMPLATE.md        # Gate 1 + Gate 2 checklists
│   └── CODEOWNERS
│
├── .husky/
│   ├── pre-commit                      # lint + typecheck + AI artifact scan
│   └── pre-push                        # optional: npm run test:smoke
│
├── docker/
│   ├── Dockerfile                      # Pinned Playwright image
│   └── docker-compose.yml              # test:smoke, test:ci, lint services
│
├── docs/
│   ├── BLUEPRINT.md                    # This file
│   ├── ROADMAP.md                      # Batch implementation plan
│   ├── SELECTOR_POLICY.md              # Locator hierarchy (Gate 1.1 audit)
│   ├── AI_VELOCITY_LOG.md              # Per-batch AI efficiency tracking
│   ├── TEST_STRATEGY.md                # Tag tiers for stakeholders (Batch 6)
│   └── adr/
│       ├── 0001-page-object-boundaries.md
│       └── 0002-tag-based-execution-over-folder-tiers.md
│
├── src/                                # Framework code (non-test)
│   ├── config/
│   │   ├── environments.ts             # baseURL, timeouts, workers per env
│   │   └── test-tags.ts                # TAGS.SMOKE, TAGS.REGRESSION, grep helpers
│   │
│   ├── fixtures/
│   │   ├── index.ts                    # Custom test export — specs import from here
│   │   ├── pages.fixture.ts            # Injects page objects into test context
│   │   └── test-data.fixture.ts        # Scoped data per worker (optional)
│   │
│   ├── pages/
│   │   ├── base.page.ts                # goto(), waitForLoaded(), shared helpers
│   │   ├── components/                 # Reusable UI fragments
│   │   │   └── footer.component.ts
│   │   └── the-internet/               # Feature-grouped page objects
│   │       ├── landing.page.ts
│   │       ├── add-remove-elements.page.ts
│   │       ├── dynamic-controls.page.ts
│   │       └── challenging-dom.page.ts
│   │
│   ├── data/
│   │   ├── navigation.map.ts           # Landing link registry
│   │   ├── credentials.ts              # Auth values from env vars only
│   │   └── builders/
│   │       └── element-count.builder.ts
│   │
│   ├── utils/
│   │   ├── wait.ts
│   │   └── reporters/
│   │       └── metrics-reporter.ts
│   │
│   └── types/
│       └── index.ts
│
├── tests/                              # FLAT — one file per feature, NO subfolders
│   ├── landing.spec.ts                 # @smoke + @regression tags in titles
│   ├── add-remove-elements.spec.ts
│   ├── dynamic-controls.spec.ts
│   └── challenging-dom.spec.ts
│
├── reports/                            # Gitignored — generated artifacts
│   ├── html/
│   ├── junit/
│   └── metrics/
│
├── .env.example
├── .gitignore
├── .prettierrc
├── .eslintrc.cjs
├── AGENTS.md                           # AI agent boundaries
├── CONTRIBUTING.md
├── playwright.config.ts                # testDir: './tests' — no tier testMatch
├── tsconfig.json
├── package.json
└── README.md
```

---

## `tests/` — flat, feature-based layout

```text
tests/
├── landing.spec.ts
│   ├── test.describe('Page content')
│   │   └── has title and headings @smoke
│   └── test.describe('Link navigation')
│       ├── navigates to Add/Remove Elements @smoke
│       └── navigates to all mapped links @regression
│
├── add-remove-elements.spec.ts
│   ├── test.describe('Happy path')
│   │   └── adds and removes elements @smoke
│   └── test.describe('Edge cases')
│       └── handles rapid add/remove cycles @regression
│
├── dynamic-controls.spec.ts
│   ├── test.describe('Input enable/disable')  → @smoke / @regression
│   └── test.describe('Checkbox visibility')     → @smoke / @regression
│
└── challenging-dom.spec.ts
    ├── test.describe('Button interactions')     → @smoke
    └── test.describe('Table assertions')        → @regression
```

### Execution — tags, not paths

| Command | Filter | When |
| --- | --- | --- |
| `npm run test:smoke` | `--grep @smoke` | PR, pre-push hook |
| `npm run test:regression` | `--grep @regression` | Nightly |
| `npm run test:ci` | `--grep-invert @flaky` | Main branch CI |
| `npm test` | none | Full local run |

> **Forbidden:** `tests/smoke/`, `tests/regression/`, `tests/e2e/` as directory tiers.

---

## `src/` — multi-layer framework layout

```text
src/
│
├── config/          Layer 1 — Environment & execution policy
│   ├── environments.ts     BASE_URL, timeouts, worker count
│   └── test-tags.ts        TAGS constant + grep pattern exports
│
├── fixtures/        Layer 2 — Dependency injection
│   ├── index.ts            export { test, expect } from merged fixtures
│   └── pages.fixture.ts    { landingPage, addRemoveElementsPage, ... }
│
├── pages/           Layer 3 — UI encapsulation (no assertions)
│   ├── base.page.ts
│   ├── components/
│   └── the-internet/       One page class per URL / UI state
│
├── data/            Layer 4 — Test data & builders
│   ├── navigation.map.ts
│   ├── credentials.ts
│   └── builders/
│
├── utils/           Layer 5 — Cross-cutting helpers
│   └── reporters/
│
└── types/           Layer 6 — Shared TypeScript interfaces
```

### Layer rules

| Layer | Owns | Must not own |
| --- | --- | --- |
| `config/` | Env vars, tag constants, timeout defaults | Locators, test assertions |
| `fixtures/` | Wiring page objects + data into test context | Business logic |
| `pages/` | Locators (`readonly`) and user actions | `expect()` calls |
| `data/` | Static maps, builders, env-based credentials | DOM interaction |
| `utils/` | Reporters, wait helpers | Feature-specific logic |
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

## CI pipeline (tag-based)

```text
Gate 1 (local)                     Gate 2 (CI / Docker)
─────────────────                  ─────────────────────
1.1 Cursor AI review               lint → typecheck
1.2 Husky pre-commit                    ↓
         ↓                         --grep @smoke (PR)
    git push                            ↓
         ↓                         --grep-invert @flaky (main)
    open PR                             ↓
                                   block merge on failure
```

---

## Migration map (current → target)

| Current | Target | Batch |
| --- | --- | --- |
| `pages/add-remove-elements.page.ts` | `src/pages/the-internet/add-remove-elements.page.ts` | 2 |
| `tests/smoke-internet.spec.ts` | `tests/add-remove-elements.spec.ts` | 3 |
| `tests/landing.spec.ts` | `tests/landing.spec.ts` (add tags, use fixtures) | 3 |
| `utils/test-data.ts` | `src/data/navigation.map.ts` | 2 |
| `playwright.config.ts` (monolithic) | `src/config/environments.ts` + thin config | 1 |
| `.github/workflows/playwright.yml` | `.github/workflows/ci.yml` | 4 |

---

## What we intentionally avoid

- **Tier subfolders** — `tests/smoke/`, `tests/regression/` duplicate files and split feature context
- **Tier suffixes in filenames** — `*.smoke.spec.ts` encodes execution intent in the path
- **Assertions in page objects** — failure messages belong in the spec layer
- **Raw CSS / XPath** — forbidden unless DOM limitation requires it (inline comment mandatory)
- **Hardcoded credentials** — env vars + `.env.example` only
- **Duplicated locators in specs** — belongs in a page object
- **God fixtures** — one fixture file per concern, merged in `index.ts`
