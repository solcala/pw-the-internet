export const TAGS = {
  SMOKE: '@smoke',
  REGRESSION: '@regression',
  E2E: '@e2e',
  FLAKY: '@flaky',
} as const;

export type TestTag = (typeof TAGS)[keyof typeof TAGS];
