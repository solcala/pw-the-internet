export const TAGS = {
  SMOKE: '@smoke',
  REGRESSION: '@regression',
  E2E: '@e2e',
  FLAKY: '@flaky',
} as const;

export type TestTag = (typeof TAGS)[keyof typeof TAGS];

/**
 * Tag usage in spec titles: `test(\`loads page ${TAGS.SMOKE}\`, ...)`
 *
 * Suite filters (package.json / CI):
 * - `test:smoke`      → `--grep ${TAGS.SMOKE}`
 * - `test:regression` → `--grep ${TAGS.REGRESSION}`
 * - `test:ci`         → `--grep-invert ${TAGS.FLAKY}`
 */
export const grepPatterns = {
  smoke: TAGS.SMOKE,
  regression: TAGS.REGRESSION,
  e2e: TAGS.E2E,
  invertFlaky: TAGS.FLAKY,
} as const;
