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

const custom = {
  dirs: { decisions: 'adrs' },
  site: {
    organization: 'Example Org',
    homepage: 'https://www.example.com/',
    legalName: 'Example, Inc.',
    license: '',
    language: 'fr-CA',
    title: 'Choices',
    description: 'Why we chose what we chose',
    icon: 'psychology',
    'override:social': [
      { label: 'GitHub', url: 'https://github.com/example', icon: 'github' },
      { label: 'Feed', url: '{feed}', icon: 'rss_feed' },
    ],
  },
  navigation: {
    'override:primary': [
      { label: 'Decisions', url: '/{decisions}/', icon: 'verified' },
    ],
    utility: [
      { label: 'Handbook', url: 'https://handbook.example.com/', icon: 'book' },
    ],
  },
  'override:practiceAreas': [{ name: 'Design', icon: 'palette' }],
};

let builds;
async function defaultAndCustom() {
  builds ??= Promise.all([build(), build({ plugin: custom })]);
  const [defaults, modified] = await builds;
  const html = (pages, url) => parse(byUrl(pages, url)[0].content);
  return {
    defaults,
    modified,
    home: html(modified, '/'),
    defaultHome: html(defaults, '/'),
    about: html(modified, '/about/'),
  };
}

test('site metadata sets the page head', async () => {
  const { home, about } = await defaultAndCustom();
  assert.equal(home.querySelector('html').getAttribute('lang'), 'fr-CA');
  assert.equal(home.querySelector('title').text, 'Choices — Example Org');
  assert.equal(about.querySelector('title').text, 'About — Example Org');
  assert.equal(home.querySelector('h1').text, 'Choices');
  assert.equal(
    home.querySelector('meta[name="description"]').getAttribute('content'),
    'Why we chose what we chose',
  );
  assert.equal(
    home.querySelector('link[rel="alternate"]').getAttribute('title'),
    'Choices (Atom)',
  );
});

test('site icon changes the logo and favicon', async () => {
  const { defaults, modified, home, defaultHome } = await defaultAndCustom();
  const logo = (doc) => doc.querySelector('.site-nav > a');
  assert.equal(logo(home).getAttribute('aria-label'), 'Example Org');
  assert.equal(logo(home).getAttribute('href'), 'https://www.example.com/');
  assert.notEqual(logo(home).innerHTML, logo(defaultHome).innerHTML);
  const favicon = (pages) => byUrl(pages, '/favicon.svg')[0].content;
  assert.notEqual(favicon(modified), favicon(defaults));
});

test('footer shows the legal name and social links', async () => {
  const { home } = await defaultAndCustom();
  const footer = home.querySelector('.site-footer');
  assert.equal(
    footer.querySelector('p').text.replace(/\s+/g, ' ').trim(),
    `© ${new Date().getFullYear()} Example, Inc.`,
  );
  assert.deepEqual(
    footer
      .querySelectorAll('.social-links a')
      .map((a) => [a.getAttribute('aria-label'), a.getAttribute('href')]),
    [
      ['GitHub', 'https://github.com/example'],
      ['Feed', '/feed.xml'],
    ],
  );
});

test('navigation and practice areas can be replaced or extended', async () => {
  const { modified, home } = await defaultAndCustom();
  const [primary, areas, utility] = home
    .querySelectorAll('.site-nav .menu > ul')
    .map((list) =>
      list
        .querySelectorAll('a')
        .map((a) => [a.getAttribute('aria-label'), a.getAttribute('href')]),
    );
  assert.deepEqual(primary, [['Decisions', '/adrs/']]);
  assert.deepEqual(areas, [['Design', '/practice-areas/design/']]);
  assert.deepEqual(utility, [
    ['Contributors', '/contributors/'],
    ['About', '/about/'],
    ['Handbook', 'https://handbook.example.com/'],
  ]);
  assert.equal(byUrl(modified, '/practice-areas/engineering/').length, 0);
});
