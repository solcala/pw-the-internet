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

exit 0
