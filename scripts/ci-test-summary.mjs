#!/usr/bin/env node
/**
 * Reads reports/metrics/summary.json and appends a markdown table to GITHUB_STEP_SUMMARY.
 * Usage: node scripts/ci-test-summary.mjs [event-name]
 */
import { readFileSync, appendFileSync } from 'node:fs';

const eventName = process.argv[2] ?? 'unknown';
const summaryPath = 'reports/metrics/summary.json';
const summaryFile = process.env.GITHUB_STEP_SUMMARY;

if (!summaryFile) {
  console.log('GITHUB_STEP_SUMMARY not set — skipping job summary.');
  process.exit(0);
}

const SUITE_META = {
  pull_request: {
    filter: '@smoke',
    service: 'test-smoke',
    expected: '21 (7 scenarios × 3 browsers)',
    title: 'Gate 2 — Test Results',
  },
  push: {
    filter: 'invert @flaky',
    service: 'test-ci',
    expected: '60 (20 scenarios × 3 browsers)',
    title: 'Gate 2 — Test Results',
  },
  regression: {
    filter: '@regression',
    service: 'test-regression',
    expected: '39 (13 scenarios × 3 browsers)',
    title: 'Nightly — Regression Results',
  },
};

const suiteMeta = SUITE_META[eventName] ?? SUITE_META.push;

let summary;
try {
  summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
} catch {
  appendFileSync(
    summaryFile,
    [
      `## ${suiteMeta.title}`,
      '',
      `_Metrics file not found at \`${summaryPath}\`. Run tests with the metrics reporter enabled._`,
      '',
    ].join('\n'),
  );
  process.exit(0);
}

const formatMs = (ms) => `${(ms / 1000).toFixed(1)}s`;
const formatRate = (rate) => `${(rate * 100).toFixed(1)}%`;

const browserRows = Object.entries(summary.by_browser ?? {})
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([browser, stats]) => {
    const total = stats.passed + stats.failed + stats.skipped;
    const rate = total === 0 ? '—' : formatRate(stats.passed / total);
    return `| ${browser} | ${stats.passed} | ${stats.failed} | ${stats.skipped} | ${formatMs(stats.duration_ms)} | ${rate} |`;
  })
  .join('\n');

const tagRows = Object.entries(summary.by_tag ?? {})
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([tag, stats]) => {
    const rate = stats.total === 0 ? '—' : formatRate(stats.passed / stats.total);
    return `| ${tag} | ${stats.passed} | ${stats.failed} | ${stats.skipped} | ${stats.total} | ${rate} |`;
  })
  .join('\n');

appendFileSync(
  summaryFile,
  [
    `## ${suiteMeta.title}`,
    '',
    '| Item | Value |',
    '| --- | --- |',
    `| Event | \`${eventName}\` |`,
    `| Grep filter | \`${suiteMeta.filter}\` |`,
    `| Docker service | \`${suiteMeta.service}\` |`,
    `| Expected tests | ${suiteMeta.expected} |`,
    `| Actual tests | ${summary.total} |`,
    `| Pass rate | ${formatRate(summary.pass_rate)} |`,
    `| Flaky | ${summary.flaky} |`,
    `| Duration | ${formatMs(summary.duration_ms)} |`,
    '',
    '### By browser',
    '',
    '| Browser | Passed | Failed | Skipped | Duration | Pass rate |',
    '| --- | --- | --- | --- | --- | --- |',
    browserRows || '| — | — | — | — | — | — |',
    '',
    '### By tag',
    '',
    '| Tag | Passed | Failed | Skipped | Total | Pass rate |',
    '| --- | --- | --- | --- | --- | --- |',
    tagRows || '| — | — | — | — | — |',
    '',
  ].join('\n'),
);
