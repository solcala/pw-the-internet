import { defineConfig, devices } from '@playwright/test';
import { environments } from './src/config/environments';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: environments.isCI,
  retries: environments.retries,
  workers: environments.workers,
  reporter: environments.isCI
    ? [
        ['github'],
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'reports/junit/results.xml' }],
      ]
    : 'html',
  use: {
    baseURL: environments.baseURL,
    trace: environments.isCI ? 'retain-on-failure' : 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
