import * as fs from 'node:fs';
import * as path from 'node:path';
import { TAGS } from '@config/test-tags';
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

const KNOWN_TAGS = Object.values(TAGS);

type BrowserStats = {
  passed: number;
  failed: number;
  skipped: number;
  duration_ms: number;
};

type TagStats = {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
};

export type MetricsSummary = {
  timestamp: string;
  duration_ms: number;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  pass_rate: number;
  by_browser: Record<string, BrowserStats>;
  by_tag: Record<string, TagStats>;
};

type MetricsReporterOptions = {
  outputFile?: string;
};

function extractTags(title: string): string[] {
  return KNOWN_TAGS.filter((tag) => title.includes(tag));
}

function emptyBrowserStats(): BrowserStats {
  return { passed: 0, failed: 0, skipped: 0, duration_ms: 0 };
}

function emptyTagStats(): TagStats {
  return { passed: 0, failed: 0, skipped: 0, total: 0 };
}

function isFailed(result: TestResult): boolean {
  return (
    result.status === 'failed' || result.status === 'timedOut' || result.status === 'interrupted'
  );
}

function isSkipped(result: TestResult): boolean {
  return result.status === 'skipped';
}

function isFlaky(test: TestCase): boolean {
  const results = test.results;
  return results.length > 1 && results.at(-1)?.status === 'passed';
}

function recordBrowser(
  byBrowser: Record<string, BrowserStats>,
  browser: string,
  result: TestResult,
): void {
  const stats = byBrowser[browser] ?? emptyBrowserStats();
  stats.duration_ms += result.duration;

  if (isSkipped(result)) {
    stats.skipped += 1;
  } else if (isFailed(result)) {
    stats.failed += 1;
  } else {
    stats.passed += 1;
  }

  byBrowser[browser] = stats;
}

function recordTag(byTag: Record<string, TagStats>, tag: string, result: TestResult): void {
  const stats = byTag[tag] ?? emptyTagStats();
  stats.total += 1;

  if (isSkipped(result)) {
    stats.skipped += 1;
  } else if (isFailed(result)) {
    stats.failed += 1;
  } else {
    stats.passed += 1;
  }

  byTag[tag] = stats;
}

class MetricsReporter implements Reporter {
  private suite!: Suite;
  private readonly outputFile: string;

  constructor(options: MetricsReporterOptions = {}) {
    this.outputFile = options.outputFile ?? 'reports/metrics/summary.json';
  }

  onBegin(_config: FullConfig, suite: Suite): void {
    this.suite = suite;
  }

  onEnd(result: FullResult): void {
    const byBrowser: Record<string, BrowserStats> = {};
    const byTag: Record<string, TagStats> = {};

    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let flaky = 0;

    for (const test of this.suite.allTests()) {
      const lastResult = test.results.at(-1);
      if (!lastResult) {
        continue;
      }

      const browser = test.parent.project()?.name ?? 'unknown';
      recordBrowser(byBrowser, browser, lastResult);

      const tags = extractTags(test.title);
      if (tags.length === 0) {
        recordTag(byTag, 'untagged', lastResult);
      } else {
        for (const tag of tags) {
          recordTag(byTag, tag, lastResult);
        }
      }

      if (isFlaky(test)) {
        flaky += 1;
      }

      if (isSkipped(lastResult)) {
        skipped += 1;
      } else if (isFailed(lastResult)) {
        failed += 1;
      } else {
        passed += 1;
      }
    }

    const total = passed + failed + skipped;
    const summary: MetricsSummary = {
      timestamp: new Date().toISOString(),
      duration_ms: result.duration,
      total,
      passed,
      failed,
      skipped,
      flaky,
      pass_rate: total === 0 ? 1 : passed / total,
      by_browser: byBrowser,
      by_tag: byTag,
    };

    const outputPath = path.resolve(this.outputFile);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  }
}

export default MetricsReporter;
