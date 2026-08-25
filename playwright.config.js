import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Visual baselines are rendered in the Docker container (npm test);
  // skip screenshot assertions for direct host runs (npm run test:local).
  ignoreSnapshots: !process.env.E2E_IN_DOCKER,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:8181',
    trace: 'on-first-retry',
  },
  webServer: {
    command:
      'SAMPLE_CONTENT_TODAY=2026-08-01 node scripts/generate-adrs.js && npx eleventy --serve --port=8181',
    url: 'http://localhost:8181',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'chromium-mobile',
      testMatch: /visual\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 812 },
      },
    },
    {
      name: 'firefox',
      testMatch: /(search|sidebar)\.spec\.js/,
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
