import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'node-html-parser';
import { build, byUrl, inputWith } from './helpers.js';

test('practice areas without decisions are hidden', async () => {
  const plugin = {
    dirs: { decisions: 'adrs' },
    practiceAreas: [{ name: 'Accessibility', icon: 'accessibility' }],
  };
  const link = /href="\/practice-areas\/accessibility\/"/;

  const empty = await build({ plugin });
  assert.equal(byUrl(empty, '/practice-areas/accessibility/').length, 0);
  assert.doesNotMatch(byUrl(empty, '/')[0].content, link);
  assert.equal(byUrl(empty, '/practice-areas/engineering/').length, 1);

  const input = inputWith({
    'adrs/20260101-accessible-forms.md':
      '---\ndate: 2026-01-01\ntitle: Accessible forms\npracticeArea: Accessibility\nstatus: accepted\n---\nBody',
  });
  const used = await build({ input, plugin });
  assert.equal(byUrl(used, '/practice-areas/accessibility/').length, 1);
  assert.match(byUrl(used, '/')[0].content, link);
});

test('site icon links to the organization homepage', async () => {
  const logo = (pages) =>
    parse(byUrl(pages, '/')[0].content)
      .querySelector('.site-nav > a')
      .getAttribute('href');

  assert.equal(logo(await build()), 'https://www.lullabot.com/');
  const plugin = { dirs: { decisions: 'adrs' }, site: { homepage: '' } };
  assert.equal(logo(await build({ plugin })), '/');
});
