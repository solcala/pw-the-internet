# Branch protection ruleset

Blocks merges to `main` / `master` until CI passes. The workflow ([`ci.yml`](../workflows/ci.yml)) runs checks; this ruleset **requires** them before merge.

**File:** [`protect-main.json`](protect-main.json)

## Required checks

Must match job `name:` in `ci.yml`:

| `context` in JSON | CI job |
| --- | --- |
| `Lint & Typecheck` | lint |
| `Tests (Docker)` | test |

Run CI at least once on a PR before importing — GitHub needs those check names to exist.

## Import via GitHub UI

1. **Settings → Rules → Rulesets → New branch ruleset**
2. **Import** → select `protect-main.json` (or paste its contents)
3. Confirm checks: **Lint & Typecheck**, **Tests (Docker)**
4. Enforcement: **Active** → Save

## Import via GitHub CLI

```bash
gh auth login
gh api repos/{owner}/{repo}/rulesets --method POST --input .github/rulesets/protect-main.json
```

Example for this repo:

```bash
gh api repos/solcala/pw-the-internet/rulesets --method POST --input .github/rulesets/protect-main.json
```

## Check names not found?

Open a PR after CI runs → **Checks** tab → note exact names. Update `context` in `protect-main.json` if they differ (e.g. `CI / Lint & Typecheck`), then re-import.
