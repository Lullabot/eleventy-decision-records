import { test, expect } from '@playwright/test';

// Sample content is generated with SAMPLE_CONTENT_TODAY=2026-08-01, so
// these URLs are deterministic. Relative ages ("2 days ago") still drift
// with the real clock, so <time> elements are masked.
// Playwright's mouse starts at (0,0), which hovers the top nav item and
// shows its tooltip; park it over empty page padding before screenshots.
async function parkMouse(page) {
  await page.mouse.move(720, 4);
}

const pages = [
  ['home', '/'],
  ['decisions', '/adrs/'],
  ['adr-detail', '/adrs/20240115-fixture-decision-record/'],
  ['topic', '/topics/tempor/'],
  ['practice-area', '/practice-areas/engineering/'],
  ['contributors', '/contributors/'],
  ['contributor', '/contributors/lorem-ipsum/'],
  ['about', '/about/'],
];

for (const [name, path] of pages) {
  test(`${name} page`, async ({ page }) => {
    await page.goto(path);
    await parkMouse(page);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      mask: [page.locator('time')],
    });
  });
}

test('expanded menu', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.locator('.site-nav')).toHaveClass(/expanded/);
  await parkMouse(page);
  await expect(page).toHaveScreenshot('expanded-menu.png', {
    mask: [page.locator('time')],
  });
});

test('search dialog with results', async ({ page }) => {
  await page.goto('/');
  // On mobile the search button lives inside the collapsed menu.
  if (page.viewportSize().width < 768) {
    await page.getByRole('button', { name: 'Menu' }).click();
  }
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('searchbox').fill('lorem');
  await expect
    .poll(() => page.locator('#search-dialog li article').count())
    .toBeGreaterThan(0);
  await expect(page.locator('#search-dialog .results-summary')).toHaveText(
    /results for/,
  );
  await parkMouse(page);
  await expect(page).toHaveScreenshot('search-dialog.png', {
    mask: [page.locator('#search-dialog .age')],
  });
});
