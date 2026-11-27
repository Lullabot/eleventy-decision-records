import { test } from 'node:test';
import { assertThemeSite, build } from './helpers.js';

test('default configuration', async () => {
  assertThemeSite(await build());
});

test('custom includes directory', async () => {
  assertThemeSite(await build({ dir: { includes: 'partials' } }));
});

test('custom layouts directory', async () => {
  assertThemeSite(await build({ dir: { layouts: '_layouts' } }));
});

test('template engines left at their defaults', async () => {
  assertThemeSite(await build({ engines: {} }));
});

test(
  'decisions directory with a trailing slash',
  { skip: 'dirs.decisions is not normalized yet' },
  async () => {
    assertThemeSite(await build({ plugin: { dirs: { decisions: 'adrs/' } } }));
  },
);
