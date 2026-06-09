# AI Agent Instructions

> **Audience:** Cursor, Copilot, and any AI assistant working in this repository.
>
> **Role:** Senior QA Automation Engineer — Playwright + TypeScript, Page Object Model, dual-gate quality.

This file is the **canonical, tool-agnostic summary** of agent boundaries. Cursor-specific rules live in [`.cursor/rules/`](.cursor/rules/). Human workflow detail lives in [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## Required reading (before generating code)

Read these **before** drafting or modifying tests, page objects, fixtures, or config:

| Document | Purpose |
| --- | --- |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Methodology, dual-gate workflow, AI conventions (§8–9) |
| [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md) | Approved folder structure and layer boundaries |
| [`docs/SELECTOR_POLICY.md`](docs/SELECTOR_POLICY.md) | Locator hierarchy — Gate 1.1 audit standard |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Batch implementation order — one batch per PR |

When authoring prompts, use explicit `@file` references to the documents above or to existing source files.

---

## Hard boundaries

These rules are **non-negotiable**:

| Rule | Detail |
| --- | --- |
| **Audit only** | AI review is read-only. **Never** auto-commit, auto-push, or open PRs without explicit human request. |
| **Structure** | **Never** create files outside [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md). No `tests/smoke/`, `tests/regression/`, or tier suffixes. |
| **Roadmap** | **One batch per PR.** Follow [`docs/ROADMAP.md`](docs/ROADMAP.md) sequentially — do not jump ahead. |
| **Language** | All code, comments, docs, and commit messages in **English**. |
| **Secrets** | No hardcoded credentials, tokens, or passwords. Config flows via `.env` → `src/config/environments.ts`. |
| **Production-ready** | No placeholder stubs, `// TODO: AI Generated`, `page.pause()`, `page.waitForTimeout()`, or debug `console.log` in committed code. |

---

## Architecture

Canonical layout: [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md)

### Flat `tests/` — tags, not folders

- One file per feature: `tests/{feature}.spec.ts` (kebab-case)
- Execution tiers via **tags in test titles**: `@smoke`, `@regression`, `@e2e`, `@flaky`
- Tag constants: [`src/config/test-tags.ts`](src/config/test-tags.ts)
- Happy and negative paths live in the **same** file, grouped by `test.describe`

**Forbidden:** `tests/smoke/`, `tests/regression/`, `*.smoke.spec.ts`, folder-based `testMatch` tiers.

### Layer boundaries

| Layer | Owns | Must NOT own |
| --- | --- | --- |
| `src/pages/` | `readonly` locators, user actions | `expect()` assertions |
| `tests/` | assertions, tags, `test.describe` groups | raw locators, direct `@playwright/test` import |
| `src/fixtures/` | custom `test` export, page injection | business logic |
| `src/data/` | maps, builders, env credentials | DOM interaction |
| `src/config/` | `environments.ts`, `test-tags.ts` | locators |

### Required imports

```typescript
// ✅ Specs
import { test, expect } from '@fixtures';

// ❌ Specs
import { test, expect } from '@playwright/test';
```

Use path aliases: `@fixtures`, `@pages/*`, `@data/*`, `@config/*`, `@utils/*`. No deep relative imports in new code.

---

## Selector policy

Authoritative detail: [`docs/SELECTOR_POLICY.md`](docs/SELECTOR_POLICY.md). Audited at **Gate 1.1** before every commit.

**Strict locator order** — use the first applicable strategy:

1. `getByRole(role, { name })` — buttons, links, headings, inputs, checkboxes
2. `getByLabel()`
3. `getByPlaceholder()`
4. `getByTestId()` — team-owned `data-testid` only
5. `getByText()` — **non-interactive copy only** (alerts, status). Forbidden on buttons, links, inputs
6. CSS / XPath — **forbidden** unless `SELECTOR EXCEPTION:` comment documents why

**Specs must not define locators** — use page objects injected via `@fixtures`.

Dynamic locators must return explicit `Locator` types. Scope lists with `.filter({ hasText })`, then target children with `getByRole`.

---

## Quality gates

Full workflow: [`CONTRIBUTING.md`](CONTRIBUTING.md) §9

### Gate 1 — Local (before commit / push)

| Gate | What | Command / action |
| --- | --- | --- |
| **1.1** | Cursor AI audit vs selector policy + POM rules | Review staged files; fix violations |
| **1.2** | Lint + typecheck + AI artifact scan | Husky `pre-commit` — `npm run lint`, `npm run typecheck` |
| **1.3** | Smoke suite in Docker | Husky `pre-push` — `npm run docker:test:smoke` |

### Gate 1.1 self-check

- [ ] Locators follow hierarchy; no CSS/XPath without exception comment
- [ ] No `expect()` inside page objects
- [ ] No `page.waitForTimeout()` or `page.pause()`
- [ ] Imports use path aliases (`@fixtures`, `@pages`, `@data`)
- [ ] Test titles include `@smoke` or `@regression` where appropriate
- [ ] One spec file per feature — tags in titles, not folder splits
- [ ] No secrets or hardcoded credentials

### Gate 2 — Remote (CI)

GitHub Actions runs in the Playwright Docker image. Local Gate 1.3 does not replace CI. PRs target `@smoke` via `--grep`; main uses `--grep-invert @flaky`.

### Docker-first validation

For gate validation, prefer Docker wrappers over bare-metal runs:

| Intent | Command |
| --- | --- |
| Smoke | `npm run docker:test:smoke` |
| Regression | `npm run docker:test:regression` |
| CI suite | `npm run docker:test:ci` |
| Lint + typecheck | `npm run docker:lint` |

Playwright version in `package.json` must match the `mcr.microsoft.com/playwright` Docker image tag.

---

## When to use AI

| Task | AI appropriate? |
| --- | --- |
| Scaffold page object from exploration | ✅ Yes — then Gate 1.1 review |
| Generate test from acceptance criteria | ✅ Yes — then Gate 1.1 review |
| Refactor to fixtures pattern | ✅ Yes — then Gate 1.1 review |
| Audit locators against selector policy | ✅ Yes — mandatory before commit |
| Modify CI/CD workflows | ⚠️ Assisted — human confirms + full CI run |
| `git commit` / `git push` | ❌ Never automated |

### Pre-commit review prompt (audit only)

```text
Review my staged changes against CONTRIBUTING.md and docs/SELECTOR_POLICY.md.
Check: getByRole hierarchy, no assertions in POMs, correct @smoke/@regression tags,
@fixtures imports, no waitForTimeout. Report violations only — do not commit.
```

---

## Session closure

Before opening a batch PR:

1. Confirm Gate 1.1–1.3 checks pass (or document escape hatch in PR template).
2. Run the Meta-Prompt Evaluation from [`CONTRIBUTING.md`](CONTRIBUTING.md) §9.
3. Append scores to [`docs/AI_VELOCITY_LOG.md`](docs/AI_VELOCITY_LOG.md).

**KPI targets:** Prompt-to-Code Ratio < 3 prompts per feature · Refactor Rate = zero full-file rewrites · explicit `@file` refs in every prompt.

---

## References

| Resource | Path |
| --- | --- |
| Contributing & dual-gate | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| Architecture blueprint | [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md) |
| Implementation batches | [`docs/ROADMAP.md`](docs/ROADMAP.md) |
| Locator hierarchy | [`docs/SELECTOR_POLICY.md`](docs/SELECTOR_POLICY.md) |
| Cursor-specific rules | [`.cursor/rules/`](.cursor/rules/) |
| AI velocity tracking | [`docs/AI_VELOCITY_LOG.md`](docs/AI_VELOCITY_LOG.md) |
