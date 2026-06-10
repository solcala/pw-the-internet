# ADR-0001: Page Object Boundaries

## Status

Accepted

## Context

UI automation code mixes easily with test assertions, leading to duplicated locators and brittle specs. Contributors often place `expect()` in page objects or define locators directly in spec files.

## Decision

Adopt strict POM boundaries: page objects own locators and actions; specs own assertions and tags. Readiness checks use web-first `expect()` in specs, not manual synchronization in POMs.

## Consequences

- Clear ownership per layer; Gate 1.1 audits have explicit pass/fail rules
- Slightly more fixture boilerplate per new page

## See also

- **Rules:** [`../SELECTOR_POLICY.md`](../SELECTOR_POLICY.md) — POM locator rules, sync policy, audit checklist
- **Structure:** [`../BLUEPRINT.md`](../BLUEPRINT.md) — layer boundaries
