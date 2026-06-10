# AI Agent Instructions

> **Audience:** Cursor, Copilot, and any AI assistant working in this repository.
>
> **Index only** — coding rules live in canonical docs. See [`docs/README.md`](docs/README.md).

## Before generating code

Read the canonical sources (use `@file` references in prompts):

| Document | Purpose |
| --- | --- |
| [`docs/SELECTOR_POLICY.md`](docs/SELECTOR_POLICY.md) | Locators, POM rules, sync policy, Gate 1.1 checklist |
| [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md) | Folder structure, layers, naming |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Quality gates (§9), PR workflow, AI conventions (§8) |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Current batch — one batch per PR |

## Agent-only constraints (not in coding standards)

| Rule | Detail |
| --- | --- |
| **Audit only** | Never auto-commit, auto-push, or open PRs without explicit human request |
| **Roadmap** | One batch per PR — follow [`docs/ROADMAP.md`](docs/ROADMAP.md) sequentially |
| **Language** | English for all code, comments, docs, and commit messages |
| **Production-ready** | No `// TODO: AI Generated`, stubs, `page.pause()`, or debug `console.log` |

## Pre-commit review prompt

```text
Audit staged changes against docs/SELECTOR_POLICY.md and docs/BLUEPRINT.md.
Report violations only — do not commit.
```

Full gate workflow: [`CONTRIBUTING.md`](CONTRIBUTING.md) §8–9.

## Cursor-specific rules

[`.cursor/rules/`](.cursor/rules/) — thin pointers to the canonical docs above.
