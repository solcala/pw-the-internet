#!/usr/bin/env sh
set -e

STAGED_TS=$(git diff --cached --name-only --diff-filter=ACM | grep '\.ts$' || true)

if [ -z "$STAGED_TS" ]; then
  exit 0
fi

PATTERNS='TODO: AI Generated|FIXME: AI|page\.pause\(\)|throw new Error\(.not implemented.\)'

if echo "$STAGED_TS" | xargs grep -l -E "$PATTERNS" 2>/dev/null; then
  echo "🛑 Gate 1.2 blocked: AI artifacts or unverified placeholders detected in staged files."
  exit 1
fi

STAGED_PAGES=$(echo "$STAGED_TS" | grep '^src/pages/' || true)

if [ -n "$STAGED_PAGES" ]; then
  POM_SYNC='waitForLoaded|\.waitFor\(|page\.waitForTimeout\('

  if echo "$STAGED_PAGES" | xargs grep -l -E "$POM_SYNC" 2>/dev/null; then
    echo "🛑 Gate 1.2 blocked: manual synchronization detected in page objects (use web-first expect in specs)."
    exit 1
  fi
fi

exit 0
