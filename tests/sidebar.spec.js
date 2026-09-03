import { test, expect } from '@playwright/test';

test.describe('sidebar toggle on desktop', () => {
  test('expands and collapses the nav', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('.site-nav');
    const toggle = page.getByRole('button', { name: 'Menu' });

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toHaveClass(/expanded/);

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).not.toHaveClass(/expanded/);
  });
});

test.describe('sidebar toggle on mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('opens and closes the menu overlay', async ({ page }) => {
    await page.goto('/');
    const menu = page.locator('.site-nav .menu');
    const toggle = page.getByRole('button', { name: 'Menu' });

    await expect(menu).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();
    await expect(
      page.locator('.menu a[aria-label="All decisions"]'),
    ).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();
  });

  test('menu links navigate', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.locator('.menu a[aria-label="All decisions"]').click();
    await expect(page).toHaveURL('/adrs/');
  });
});
