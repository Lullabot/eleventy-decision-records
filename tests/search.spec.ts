import { test, expect } from '@playwright/test';

test.describe('search dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Search' }).click();
  });

  test('opens with focus on the search input', async ({ page }) => {
    await expect(page.locator('#search-dialog')).toBeVisible();
    await expect(page.getByRole('searchbox')).toBeFocused();
  });

  test('returns results that link to ADRs', async ({ page }) => {
    await page.getByRole('searchbox').fill('lorem');
    const results = page.locator('#search-dialog li article');
    await expect.poll(() => results.count()).toBeGreaterThan(0);

    const firstLink = results.first().getByRole('link');
    await expect(firstLink).toHaveAttribute('href', /^\/adrs\//);
    await firstLink.click();
    await expect(page).toHaveURL(/\/adrs\/\d{8}-/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('announces a results summary to assistive tech', async ({ page }) => {
    const status = page.locator('#search-dialog [aria-live="polite"]');
    await page.getByRole('searchbox').fill('lorem');
    await expect(status).toHaveText(/\d+ results? for \u{201c}lorem\u{201d}/u);

    await page.getByRole('searchbox').fill('xyzzyplugh');
    await expect(status).toHaveText(/No results found/);

    await page.getByRole('searchbox').fill('');
    await expect(status).toHaveText('');
  });

  test('shows a message when nothing matches', async ({ page }) => {
    await page.getByRole('searchbox').fill('xyzzyplugh');
    await expect(page.locator('#search-dialog .results-summary')).toContainText(
      'No results found',
    );
    await expect(page.locator('#search-dialog li')).toHaveCount(0);
  });

  test('surfaces index fetch failures and recovers', async ({
    page,
    context,
  }) => {
    await context.route('**/searchindex.json', (route) =>
      route.fulfill({ status: 500 }),
    );
    await page.getByRole('searchbox').fill('lorem');
    await expect(page.locator('#search-dialog .results-summary')).toContainText(
      'Search is unavailable',
    );

    await context.unroute('**/searchindex.json');
    await page.getByRole('searchbox').fill('lorem ipsum');
    await expect
      .poll(() => page.locator('#search-dialog li article').count())
      .toBeGreaterThan(0);
  });

  test('escapes markup in indexed content', async ({ page }) => {
    await page.getByRole('searchbox').fill('lorem');
    await expect
      .poll(() => page.locator('#search-dialog li article').count())
      .toBeGreaterThan(0);
    expect(await page.locator('#search-dialog img').count()).toBe(0);
  });

  test('close button dismisses the dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Close search' }).click();
    await expect(page.locator('#search-dialog')).toBeHidden();
  });
});
