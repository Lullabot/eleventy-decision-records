import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { checkAccessibility } from '@lullabot/playwright-drupal';
import { baseline } from './a11y-baseline.js';

// Same deterministic URLs the visual suite screenshots, so every page
// type the theme renders gets an axe scan.
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

function describeViolations(violations) {
  return violations
    .map((v) => {
      const targets = v.nodes
        .slice(0, 5)
        .map((n) => `    ${n.target.join(' ')}`);
      if (v.nodes.length > 5) {
        targets.push(`    ...and ${v.nodes.length - 5} more`);
      }
      return [
        `${v.id} (${v.impact}): ${v.help}`,
        `  ${v.helpUrl}`,
        ...targets,
      ].join('\n');
    })
    .join('\n\n');
}

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function expectNoViolations(page, testInfo) {
  await checkAccessibility(page, testInfo, {
    wcagTags: WCAG_TAGS,
    baseline,
    disableDefaultExclusions: true,
  });
}

const INTERACTIVE = 'a[href], button, input, select, textarea, summary';

// Puts every interactive element into a pseudo-class state at once through
// the DevTools protocol, so hover and focus styles can be scanned without
// moving the mouse over each element in turn. Chromium only.
async function forcePseudoState(page, pseudoClasses) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', {
    nodeId: root.nodeId,
    selector: INTERACTIVE,
  });
  for (const nodeId of nodeIds) {
    await cdp.send('CSS.forcePseudoState', {
      nodeId,
      forcedPseudoClasses: pseudoClasses,
    });
  }
  return cdp;
}

// State changes are visual, so only the colour rules are rechecked.
const STATES = [
  ['hovered', ['hover']],
  ['focused', ['focus', 'focus-visible']],
];

const COLOUR_RULES = ['color-contrast', 'link-in-text-block'];

function targetKeys(violations) {
  return new Set(
    violations.flatMap((v) =>
      v.nodes.map((n) => `${v.id} ${n.target.join(' ')}`),
    ),
  );
}

// Reports only what the state introduces; anything already failing at
// rest belongs to the page's own test.
async function expectNoStateViolations(page, pseudoClasses) {
  const scan = () => new AxeBuilder({ page }).withRules(COLOUR_RULES).analyze();
  const atRest = targetKeys((await scan()).violations);
  const cdp = await forcePseudoState(page, pseudoClasses);
  try {
    const { violations } = await scan();
    const introduced = violations
      .map((v) => ({
        ...v,
        nodes: v.nodes.filter(
          (n) => !atRest.has(`${v.id} ${n.target.join(' ')}`),
        ),
      }))
      .filter((v) => v.nodes.length > 0);
    expect(describeViolations(introduced)).toBe('');
  } finally {
    await cdp.detach();
  }
}

for (const [name, path] of pages) {
  test(`${name} page`, async ({ page }, testInfo) => {
    await page.goto(path);
    await expectNoViolations(page, testInfo);
  });

  for (const [state, pseudoClasses] of STATES) {
    test(`${name} page, links ${state}`, async ({ page }) => {
      await page.goto(path);
      await expectNoStateViolations(page, pseudoClasses);
    });
  }
}

test('expanded menu', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.locator('.site-nav')).toHaveClass(/expanded/);
  await expectNoViolations(page, testInfo);
  await expectNoStateViolations(page, ['hover']);
});

test('search dialog with results', async ({ page }, testInfo) => {
  await page.goto('/');
  if (page.viewportSize().width < 768) {
    await page.getByRole('button', { name: 'Menu' }).click();
  }
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('searchbox').fill('lorem');
  await expect
    .poll(() => page.locator('#search-dialog li article').count())
    .toBeGreaterThan(0);
  await expectNoViolations(page, testInfo);
  await expectNoStateViolations(page, ['hover']);
});
