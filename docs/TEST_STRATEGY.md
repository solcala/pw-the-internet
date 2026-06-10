# Test Strategy

How this suite uses **tags** to support fast PR feedback and broader release confidence — without splitting tests into tier folders.

## Tag tiers

| Tag | Purpose | When it runs | Target duration |
| --- | --- | --- | --- |
| `@smoke` | Critical paths — landing, navigation to key features, happy-path flows | Every PR (Gate 2), pre-push (Gate 1.3) | < 2 minutes |
| `@regression` | Broader coverage — extra navigations, negative paths, edge assertions | Pre-release, local on demand (`docker:test:regression`) | Minutes (full regression grep) |
| `@e2e` | Reserved for future cross-feature journeys | Not used yet | — |
| `@flaky` | Known unstable tests — excluded from `test:ci` | Quarantined | — |

Tags live in **test titles** via `TAGS` constants from `src/config/test-tags.ts`. Suites are filtered with Playwright `--grep`, not folder structure.

## Release decision guide

| Question | Look at |
| --- | --- |
| Is it safe to merge this PR? | PR CI — `@smoke` must be green |
| Did we break anything important on `main`? | Full CI suite green + download HTML artifact from Actions |
| Are we ready for a release? | Full suite green + `docker:test:regression` + pass rate ≥ 98% in metrics JSON |
| What failed and where? | CI artifacts (`playwright-report/`, JUnit, traces) or local `npm run report` |

## Current suite shape

| Tier | Scenarios | Tests (× 3 browsers) |
| --- | --- | --- |
| `@smoke` | 7 | 21 |
| `@regression` | 13 | 39 |
| Full (`test:ci`) | 20 | 60 |

Commands:

```bash
npm run docker:test:smoke       # PR gate parity
npm run docker:test:regression  # broader tier
npm run docker:test:ci          # main gate parity
```

## Metrics & visibility

Every CI run writes `reports/metrics/summary.json` via the custom metrics reporter. PM-friendly fields:

- **pass_rate** — overall health
- **by_browser** — which browser broke
- **by_tag** — smoke vs regression health at a glance
- **flaky** — tests that passed only after retry

Format and KPI targets: [CONTRIBUTING.md §6](../CONTRIBUTING.md).

## Adding tests to the right tier

| Scenario type | Tag |
| --- | --- |
| Happy path, merge blocker | `@smoke` |
| Edge case, extra navigation, negative path | `@regression` |
| Known flaky (temporary) | `@flaky` |

Keep **one spec file per feature**; use `test.describe` groups inside the file. Do not create `tests/smoke/` or `tests/regression/` folders.
