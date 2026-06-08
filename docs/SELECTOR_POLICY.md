# Selector Policy

> **Status:** Enforced — audited locally by Cursor during **Gate 1.1** before every commit.
>
> This document is the authoritative locator standard for `pw-the-internet`. All page objects, components, and specs must comply.

---

## Strict locator hierarchy

Use the **first applicable** strategy in this order. Never skip a higher-priority option without documenting why in a code comment.

| Priority | Strategy | When to use |
| --- | --- | --- |
| **1** | `getByRole(role, { name })` | **Absolute priority.** Buttons, links, headings, inputs, checkboxes, dialogs |
| **2** | `getByLabel()` | Form fields with associated `<label>` elements |
| **3** | `getByPlaceholder()` | Inputs identified by placeholder when no label or role is sufficient |
| **4** | `getByTestId()` | Elements with stable `data-testid` attributes under team control |
| **5** | `getByText()` | Short, unique, stable visible text for **non-interactive** copy only (e.g. alert paragraphs, status messages, footer text). Headings must use `getByRole('heading')`. **Forbidden** on buttons, links, inputs, or any element with a native WAI-ARIA role |
| **6** | CSS / XPath | **Forbidden by default** — see exceptions below |

```typescript
// ✅ Preferred
readonly addButton = this.page.getByRole('button', { name: 'Add Element' });
readonly heading = this.page.getByRole('heading', { name: 'Add/Remove Elements' });

// ✅ Acceptable when role is insufficient
readonly emailField = this.page.getByLabel('Email');

// ⚠️ Use only when 1–3 do not apply
readonly searchInput = this.page.getByPlaceholder('Search…');

// ⚠️ Requires team-owned data-testid
readonly submitBtn = this.page.getByTestId('submit-form');

// ✅ Valid — non-interactive alert/status copy (headings use getByRole above)
readonly successMessage = this.page.getByText('Your content has been loaded successfully.');

// ❌ Forbidden — button has a native role; must use getByRole
readonly badDelete = this.page.getByText('Delete');
```

> **`getByText` on interactive elements is strictly forbidden.** If the element is a button, link, input, checkbox, or any control with a WAI-ARIA role, `getByRole(role, { name })` is mandatory.

---

## Forbidden selectors (default)

The following are **not permitted** in page objects or specs unless an exception applies:

| Selector type | Examples | Why forbidden |
| --- | --- | --- |
| Raw CSS class | `.btn-primary`, `#elements` | Breaks on styling/DOM refactors |
| XPath | `//div[@class='example']` | Fragile, unreadable, hard to maintain |
| Positional CSS | `div > div:nth-child(3)` | Breaks when DOM order changes |
| Chained CSS | `form input[type="text"]` | Couples to HTML structure |

---

## Exception: isolated DOM limitation

CSS or XPath is allowed **only** when priorities 1–5 cannot target the element due to an isolated DOM constraint (e.g., Shadow DOM pierce, canvas without ARIA, legacy widget with no semantic role).

**Requirements for any exception:**

1. Prior strategies must be documented as attempted and insufficient
2. A **mandatory inline comment** on the locator line explaining the DOM limitation
3. Human confirmation during Gate 1.1 Cursor audit

```typescript
// SELECTOR EXCEPTION: canvas element has no ARIA role or accessible name.
// getByRole/getByLabel/getByTestId not applicable. Reviewed Gate 1.1.
readonly chartCanvas = this.page.locator('#canvas'); // CSS exception — no semantic hook
```

Without the comment → **commit blocked** at Gate 1.1.

---

## Page Object locator rules

| Rule | Detail |
| --- | --- |
| Define once | Static locators are `readonly` properties; dynamic locators are typed methods returning `Locator` |
| Scope narrowly | Use `page.getByRole(...)` on the page; chain `.filter()` or parent locators for context |
| No duplicate selectors | If two tests need the same locator, it belongs in the POM |
| Dynamic lists | Private methods with explicit `Locator` return type + `.filter({ hasText })` — not global CSS |
| Shadow DOM | `page.locator('css=...')` inside shadow root with exception comment |

```typescript
import type { Locator } from '@playwright/test';

// ✅ Scoping duplicate buttons
readonly deleteButtons = this.page.getByRole('button', { name: 'Delete' });
async removeFirst(): Promise<void> {
  await this.deleteButtons.first().click();
}

// ❌ Fragile positional CSS
readonly deleteButton = this.page.locator('.added-manually').first();

// ✅ Correct dynamic scoping for dynamic rows/tables
private tableRow(rowText: string): Locator {
  return this.page.locator('tr').filter({ hasText: rowText });
}

readonly rowDeleteButton = (rowText: string): Locator =>
  this.tableRow(rowText).getByRole('button', { name: 'Delete' });
```

> For tables and dynamic lists: scope with `.filter({ hasText })` on the row parent, then target the interactive child with `getByRole`. Never use `getByText` to click a button inside a row.

---

## Spec file rules

- Specs **must not** define locators — import page objects via `@fixtures`
- Specs **must not** use `page.locator('css=...')` or XPath directly
- Tag tests in titles: `@smoke` for critical paths, `@regression` for extended coverage

---

## Gate 1.1 — Local Cursor audit

Before every `git commit`, the developer runs Cursor Agent against staged files. Cursor audits:

- [ ] Every locator follows the hierarchy (role → label → placeholder → testId → text)
- [ ] No raw CSS or XPath without a documented exception comment
- [ ] No locators defined in spec files (POM only)
- [ ] No `getByText()` on interactive elements (buttons, links, inputs) — `getByRole` required
- [ ] No `getByText()` for long or dynamic strings
- [ ] No `page.waitForTimeout()` as a locator workaround

**Pre-commit review prompt:**

```text
Audit my staged page objects and specs against docs/SELECTOR_POLICY.md.
Verify getByRole is used wherever possible. Flag any CSS/XPath without
an inline exception comment. Confirm no locators exist in spec files.
Report violations only — do not commit.
```

Violations must be fixed and the audit re-run before proceeding to Husky (Gate 1.2).

---

## Anti-patterns reference

| Anti-pattern | Fix |
| --- | --- |
| `page.locator('#btn')` | `page.getByRole('button', { name: '…' })` |
| `page.locator('.added-manually')` | `page.getByRole('button', { name: 'Delete' })` |
| `page.locator('text=Submit')` | `page.getByRole('button', { name: 'Submit' })` |
| `page.getByText('Delete')` on a button | `page.getByRole('button', { name: 'Delete' })` |
| `page.getByText('Add Element')` on a link | `page.getByRole('link', { name: 'Add Element' })` |
| Locator in spec file | Move to page object `readonly` property |
| `nth(2)` without context | Scope via parent locator or `filter({ hasText })` |

---

## References

- [Playwright Locators](https://playwright.dev/docs/locators)
- [WAI-ARIA Roles](https://www.w3.org/TR/wai-aria-1.2/#role_definitions)
- [CONTRIBUTING.md](../CONTRIBUTING.md) — AI standards and Gate 1.1 workflow (§8)
- [`BLUEPRINT.md`](BLUEPRINT.md) — where locators live in the architecture
