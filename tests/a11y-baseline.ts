import { defineAccessibilityBaseline } from '@lullabot/playwright-drupal';

// Known violations accepted for now. Each entry needs a reason and a link
// to the issue that will fix it; anything not listed here fails the suite.
export const baseline = defineAccessibilityBaseline([]);
