# Summary

- Implements batch ___ from `docs/ROADMAP.md` (if applicable)
- Feature / area: ___

## Gate 1 — Local (completed before push)

- [ ] Cursor Agent AI review passed (`SELECTOR_POLICY.md` + no assertions in POMs)
- [ ] `git commit` succeeded — Husky pre-commit (lint + typecheck) green
- [ ] `git push` succeeded — Husky pre-push Docker smoke (`npm run docker:test:smoke`) green, or `--no-verify` justified below

## Gate 2 — Remote (CI)

- [ ] [`.github/workflows/ci.yml`](.github/workflows/ci.yml) green on this PR
- [ ] **Lint & Typecheck** job passed (`docker compose run --rm lint`)
- [ ] **Tests (Docker)** job passed — `@smoke` via `test-smoke` service

## Test changes

- [ ] New or updated spec: `tests/kebab-case-feature.spec.ts`
- [ ] Tags applied: `@smoke` / `@regression` in test titles
- [ ] Smoke suite still < 2 min

## Standards

- [ ] Locators follow `docs/SELECTOR_POLICY.md` (getByRole first)
- [ ] No assertions inside page objects
- [ ] `@fixtures` import used in specs
- [ ] Path aliases used (`@pages`, `@data`)

## Notes for reviewer

<!-- Anything non-obvious: flaky test context, env var requirements, etc. -->

### ⚠️ Escape Hatch Declaration (if applicable)

- If `git push --no-verify` was used, state the technical justification here: ___
