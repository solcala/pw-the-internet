# pw-the-internet

Playwright test automation suite for [The Internet](https://the-internet.herokuapp.com/) — a demo site commonly used for QA practice and portfolio projects.

## Stack

- [Playwright](https://playwright.dev/) Test
- TypeScript
- Page Object Model (POM)
- GitHub Actions CI

## Project structure

```bash
├── pages/                  # Page Object classes
├── tests/                  # Test specs
├── utils/                  # Shared test data
├── playwright.config.ts
└── .github/workflows/      # CI pipeline
```

## Getting started

```bash
npm install
npx playwright install
```

## Running tests

```bash
# Run full suite (chromium, firefox, webkit)
npm test

# Run a single file
npx playwright test tests/smoke-internet.spec.ts

# Run with UI mode
npm run test:ui

# Open HTML report
npm run report
```

## Test coverage

| Suite | Description |
| --- | --- |
| `landing.spec.ts` | Landing page title, headings, and link navigation |
| `smoke-internet.spec.ts` | Add/Remove Elements — add 3 buttons, verify, remove all |

## CI

Tests run automatically on push and pull requests to `main` / `master` via GitHub Actions. The HTML report is uploaded as a workflow artifact.
