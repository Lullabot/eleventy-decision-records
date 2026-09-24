import { defineConfig, devices } from '@playwright/test';

const desktop = {
  ...devices['Desktop Chrome'],
  viewport: { width: 1440, height: 900 },
};
const mobile = {
  ...devices['Desktop Chrome'],
  viewport: { width: 375, height: 812 },
};

const projects = [
  {
    name: 'chromium-desktop',
    testIgnore: /accessibility\.spec\.js/,
    use: desktop,
  },
  {
    name: 'chromium-mobile',
    testMatch: /visual\.spec\.js/,
    use: mobile,
  },
  {
    name: 'firefox',
    testMatch: /(search|sidebar)\.spec\.js/,
    use: {
      ...devices['Desktop Firefox'],
      viewport: { width: 1440, height: 900 },
    },
  },
  {
    name: 'a11y-desktop',
    testMatch: /accessibility\.spec\.js/,
    use: desktop,
  },
  {
    name: 'a11y-mobile',
    testMatch: /accessibility\.spec\.js/,
    use: mobile,
  },
];

export default defineConfig({
  testDir: './tests',
  // Visual baselines are rendered in the Docker container (npm test);
  // skip screenshot assertions for direct host runs (npm run test:local).
  ignoreSnapshots: !process.env.E2E_IN_DOCKER,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { open: 'never' }],
        // Read by playwright-drupal-a11y-summary in CI.
        ['json', { outputFile: 'test-results/results.json' }],
      ]
    : 'list',
  use: {
    baseURL: 'http://localhost:8181',
    trace: 'on-first-retry',
  },
  expect: {
    // Neutralises clock-derived text and its box size for every
    // screenshot, so specs do not each have to mask <time> themselves.
    toHaveScreenshot: { stylePath: './tests/screenshot.css' },
  },
  webServer: {
    // Serves the fixture site, which consumes the theme as a packaged
    // dependency. cwd matters: the plugin resolves Nunjucks through the
    // project's own Eleventy, so it has to run from the site directory.
    command:
      'bash ../../bin/prepare-fixture-site.sh && npx eleventy --serve --port=8181',
    cwd: 'tests/fixture-site',
    url: 'http://localhost:8181',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects,
});
