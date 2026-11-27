import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build, byUrl, inputWith } from './helpers.js';

test('project template replaces a theme page', async () => {
  const input = inputWith({
    'about.njk': '---\npermalink: /about/\n---\n<p id="own-about">Ours</p>',
  });
  const pages = await build({ input });
  const about = byUrl(pages, '/about/');
  assert.equal(about.length, 1);
  assert.match(about[0].content, /id="own-about"/);
});

test('project layout replaces a theme layout', async () => {
  const input = inputWith({
    '_includes/page.njk': '<body id="own-layout">{{ content | safe }}</body>',
  });
  const pages = await build({ input });
  assert.match(byUrl(pages, '/about/')[0].content, /id="own-layout"/);
});

test('project partials add intro text to listing pages', async () => {
  const defaults = await build();
  for (const page of defaults) {
    assert.doesNotMatch(page.content, /class="page-intro"/, page.url);
  }

  const input = inputWith({
    '_includes/decisions-intro.njk': '<p id="intro">All</p>',
    '_includes/practice-area-intro.njk': '<p id="intro">{{ area.name }}</p>',
    '_includes/practice-area-intro/project-management.njk': '<p id="pm">PM</p>',
  });
  const pages = await build({ input });
  assert.match(byUrl(pages, '/adrs/')[0].content, /<p id="intro">All<\/p>/);
  assert.match(
    byUrl(pages, '/practice-areas/design/')[0].content,
    /<p id="intro">Design<\/p>/,
  );
  const pm = byUrl(pages, '/practice-areas/project-management/')[0].content;
  assert.match(pm, /<p id="pm">PM<\/p>/);
  assert.doesNotMatch(pm, /id="intro"/);
});

test('feeds can be replaced or turned off', async () => {
  const rssOnly = await build({
    plugin: {
      dirs: { decisions: 'adrs' },
      'override:feeds': [{ type: 'rss', path: '/rss.xml' }],
    },
  });
  assert.equal(byUrl(rssOnly, '/feed.xml').length, 0);
  assert.equal(byUrl(rssOnly, '/rss.xml').length, 1);
  assert.match(byUrl(rssOnly, '/')[0].content, /href="\/rss\.xml"/);

  const none = await build({
    plugin: {
      dirs: { decisions: 'adrs' },
      'override:feeds': [],
      navigation: { primary: [{ label: 'Feed', url: '{feed}' }] },
    },
  });
  assert.equal(none.filter((p) => p.url.endsWith('.xml')).length, 0);
  assert.doesNotMatch(
    byUrl(none, '/')[0].content,
    /href="(\{feed\}|\/feed|undefined)/,
  );
});

test('project template replaces a feed', async () => {
  const input = inputWith({
    'feed-atom.njk': '---\npermalink: /feed.xml\n---\n<feed id="own-feed"/>',
  });
  const feed = byUrl(await build({ input }), '/feed.xml');
  assert.equal(feed.length, 1);
  assert.match(feed[0].content, /id="own-feed"/);
});
