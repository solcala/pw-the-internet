# Documentation index

Single entry point for project documentation. **Each topic has one canonical file** — other docs link here instead of duplicating rules.

## Canonical sources (update these when rules change)

| Topic | Canonical file | What it covers |
| --- | --- | --- |
| **Code rules** | [`SELECTOR_POLICY.md`](SELECTOR_POLICY.md) | Locator hierarchy, POM boundaries, sync policy, Gate 1.1 audit checklist |
| **Structure** | [`BLUEPRINT.md`](BLUEPRINT.md) | Folder layout, layer boundaries, path aliases, naming |
| **Process** | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) | Workflow, quality gates (§9), PR process, onboarding |
| **Progress** | [`ROADMAP.md`](ROADMAP.md) | Batch checklist and implementation status only |
| **Test strategy** | [`TEST_STRATEGY.md`](TEST_STRATEGY.md) | Tag tiers, release decisions, suite shape |
| **CI pipeline** | [`../.github/workflows/ci.yml`](../.github/workflows/ci.yml) | Gate 2 — lint → Docker tests (`@smoke` on PR) |
| **Pages deploy** | [`../.github/workflows/pages.yml`](../.github/workflows/pages.yml) | `playwright-report/` after green `main` CI |
| **Code ownership** | [`../.github/CODEOWNERS`](../.github/CODEOWNERS) | Auto-review requests for `src/` and `tests/` |

## Decision log (why, not how)

| ADR | Decision |
| --- | --- |
| [`adr/0001-page-object-boundaries.md`](adr/0001-page-object-boundaries.md) | Why specs assert and page objects only hold locators/actions |
| [`adr/0002-tag-based-execution-over-folder-tiers.md`](adr/0002-tag-based-execution-over-folder-tiers.md) | Why tags + `--grep` replace `tests/smoke/` folders |

ADRs record context and trade-offs. **Do not duplicate rules from the canonical files above.**

New ADR: copy [`adr/template.md`](adr/template.md) — process in [`CONTRIBUTING.md` §10](../CONTRIBUTING.md).

## AI assistants

| File | Role |
| --- | --- |
| [`../AGENTS.md`](../AGENTS.md) | Tool-agnostic entry point — what to read, agent-only constraints |
| [`.cursor/rules/`](../.cursor/rules/) | Cursor triggers that point to canonical docs |

## Metrics

| File | Role |
| --- | --- |
| [`AI_VELOCITY_LOG.md`](AI_VELOCITY_LOG.md) | Per-batch AI efficiency scores |

## Quick links for contributors

1. New to the repo → [`../CONTRIBUTING.md`](../CONTRIBUTING.md) §11
2. Writing a page object → [`SELECTOR_POLICY.md`](SELECTOR_POLICY.md)
3. Adding a test file → [`BLUEPRINT.md`](BLUEPRINT.md) + [`SELECTOR_POLICY.md`](SELECTOR_POLICY.md)
4. Current batch work → [`ROADMAP.md`](ROADMAP.md)
