# AI Velocity Log

> Local tracking file for measuring AI-assisted development efficiency per batch.
> Updated manually or via the Meta-Prompt Evaluation Workflow (see `CONTRIBUTING.md` §9).

---

## How to use

1. At the end of each batch PR, run the **Meta-Prompt Evaluation** in Cursor (§9).
2. Append a new row to the log table below with the session scores.
3. Do not commit placeholder or unverified AI artifacts — Gate 1.1 (Local AI Review) and Husky block them (see `CONTRIBUTING.md` §9).

---

## Batch log

| Batch | Feature / PR | Prompts used | Refactors due to poor context | Context refs used (`@file`) | Score (1–5) | Optimization tip applied |
| --- | --- | --- | --- | --- | --- | --- |
| — | _Example: Batch 1 infra_ | 2 | 0 | `@CONTRIBUTING.md`, `@BLUEPRINT.md` | 4 | Batched all config in one prompt |
| | | | | | | |

---

## KPI targets

| KPI | Target | Definition |
| --- | --- | --- |
| **Prompt-to-Code Ratio** | < 3 prompts per feature | Number of Cursor prompts needed to ship one feature (POM + spec) |
| **Refactor Rate** | Zero rewrites | No full file rewrites caused by missing context in the initial prompt |
| **Context Efficiency** | Always explicit `@file` refs | Every authoring prompt references at least one project doc or source file |

---

## Session evaluation template

_Copy output from Meta-Prompt Evaluation here after each session._

```text
Batch: ___
Prompt Efficiency:    _/5
Context Management:     _/5
Refactor Rate:          _/5  (5 = zero rewrites)
Concrete optimization:  ___
```
