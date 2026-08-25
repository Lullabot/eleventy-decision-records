import { test, expect } from '@playwright/test';

// Sample content is generated with SAMPLE_CONTENT_TODAY=2026-08-01, so
// these URLs are deterministic. Relative ages ("2 days ago") still drift
// with the real clock, so <time> elements are masked.
const pages = [
  ['home', '/'],
  ['decisions', '/adrs/'],
  ['adr-detail', '/adrs/20260729-pharetra-magna-placerat-vestibulum/'],
  ['topic', '/topics/tempor/'],
  ['practice-area', '/practice-areas/engineering/'],
  ['contributors', '/contributors/'],
  ['contributor', '/contributors/lorem-ipsum/'],
  ['about', '/about/'],
];

for (const [name, path] of pages) {
  test(`${name} page`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      mask: [page.locator('time')],
    });
  });
}

test('expanded menu', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.locator('.site-nav')).toHaveClass(/expanded/);
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
  await expect(page).toHaveScreenshot('search-dialog.png', {
    mask: [page.locator('#search-dialog .age')],
  });
});
