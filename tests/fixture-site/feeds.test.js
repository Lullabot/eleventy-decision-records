import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { parse } from 'node-html-parser';
import { XMLParser } from 'fast-xml-parser';
import { build, byUrl, scratchDir } from './helpers.js';

// FEEDVALIDATOR is the src/ directory of a w3c/feedvalidator checkout, whose
// requirements python3 can import. CI sets it; see docs/development.md.
test(
  'feeds pass the W3C feed validator',
  { skip: !process.env.FEEDVALIDATOR && 'FEEDVALIDATOR is not set' },
  async () => {
    const plugin = {
      dirs: { decisions: 'adrs' },
      feeds: [{ type: 'rss', path: '/rss.xml' }],
    };
    const pages = await build({ plugin });
    const dir = scratchDir();
    for (const url of ['/feed.xml', '/rss.xml']) {
      const file = join(dir, url.slice(1));
      writeFileSync(file, byUrl(pages, url)[0].content);
      await promisify(execFile)(
        'python3',
        [
          '../../bin/validate-feed.py',
          file,
          new URL(url, 'https://architecture.lullabot.com/').href,
        ],
        { env: { ...process.env, PYTHONPATH: process.env.FEEDVALIDATOR } },
      ).catch((error) =>
        assert.fail(`${url}:\n${error.stdout}${error.stderr}`),
      );
    }
  },
);

const SITE = 'https://architecture.lullabot.com';

const feedParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseTagValue: false,
  htmlEntities: true,
  isArray: (name) => ['entry', 'item', 'category'].includes(name),
});

let built;
async function defaultFeeds() {
  built ??= build({
    plugin: {
      dirs: { decisions: 'adrs' },
      feeds: [{ type: 'rss', path: '/rss.xml' }],
    },
  });
  const pages = await built;
  const parsed = (url) => feedParser.parse(byUrl(pages, url)[0].content);
  return {
    pages,
    atom: parsed('/feed.xml').feed,
    rss: parsed('/rss.xml').rss,
  };
}

test('atom and rss feeds with default settings', async () => {
  const { atom, rss } = await defaultFeeds();
  const copyright = /^\d{4} Lullabot, Inc\. CC-BY 4\.0\.$/;
  const description =
    "Documented architectural decisions and best practices for Lullabot's team";

  assert.equal(atom['xml:lang'], 'en-US');
  assert.equal(atom.title, 'Decision Records — Lullabot');
  assert.equal(atom.subtitle, description);
  assert.deepEqual(atom.link, [
    { href: `${SITE}/feed.xml`, rel: 'self' },
    { href: `${SITE}/` },
  ]);
  assert.equal(atom.id, `${SITE}/`);
  assert.equal(atom.author.name, 'Lullabot');
  assert.match(atom.rights, copyright);
  const updated = atom.entry.map((entry) => entry.updated);
  assert.deepEqual(updated, updated.toSorted().reverse(), 'newest first');
  assert.equal(atom.updated, updated[0]);

  assert.equal(rss.version, '2.0');
  const { channel } = rss;
  assert.equal(channel.title, 'Decision Records — Lullabot');
  assert.equal(channel.link, `${SITE}/`);
  assert.deepEqual(channel['atom:link'], {
    href: `${SITE}/rss.xml`,
    rel: 'self',
    type: 'application/rss+xml',
  });
  assert.equal(channel.description, description);
  assert.equal(channel.language, 'en-US');
  assert.match(channel.copyright, copyright);
  const published = channel.item.map((item) => Date.parse(item.pubDate));
  assert.deepEqual(published, published.toSorted().reverse(), 'newest first');
  assert.equal(Date.parse(channel.lastBuildDate), published[0]);
});

test('feeds label records that are not accepted', async () => {
  const { atom, rss } = await defaultFeeds();
  const labelled = (titles) => titles.filter((title) => title.startsWith('['));
  const expected = ['[deprecated] Faucibus scelerisque eleifend donec pretium'];
  assert.deepEqual(labelled(atom.entry.map((entry) => entry.title)), expected);
  assert.deepEqual(
    labelled(rss.channel.item.map((item) => item.title)),
    expected,
  );
});

// The typography specimen sets every frontmatter field in docs/writing-adrs.md.
test("feeds carry a record's frontmatter", async () => {
  const { atom, rss } = await defaultFeeds();
  const url = `${SITE}/adrs/20230801-typography-specimen/`;
  const title =
    'Typography specimen covering every heading level and inline element';
  const context =
    'Exercises the prose styles real decision records rely on, from h1 to h6 and each inline element Markdown or raw HTML can produce.';

  const entry = atom.entry.find((e) => e.id === url);
  assert.equal(entry.title, title);
  assert.deepEqual(entry.link, { href: url });
  assert.equal(entry.updated, '2023-08-01T00:00:00Z');
  assert.equal(entry.summary, context);
  assert.deepEqual(entry.category, [
    { term: 'lorem', scheme: `${SITE}/topics/` },
    { term: 'dolor', scheme: `${SITE}/topics/` },
    { term: 'Design', scheme: `${SITE}/practice-areas/` },
  ]);
  assert.equal(entry.content.type, 'html');
  assert.match(entry.content['#text'], /<h2[^>]*>Heading level two/);

  const item = rss.channel.item.find((i) => i.link === url);
  assert.equal(item.title, title);
  assert.equal(item.guid, url);
  assert.equal(
    new Date(item.pubDate).toISOString(),
    '2023-08-01T00:00:00.000Z',
  );
  assert.equal(item.description, context);
  assert.deepEqual(item.category, [
    { '#text': 'lorem', domain: 'topic' },
    { '#text': 'dolor', domain: 'topic' },
    { '#text': 'Design', domain: 'practiceArea' },
  ]);
});

test('home page links to each feed', async () => {
  const { pages } = await defaultFeeds();
  const home = parse(byUrl(pages, '/')[0].content);
  assert.ok(home.querySelector('footer a[href="/feed.xml"]'));
  assert.deepEqual(
    home
      .querySelectorAll('head link[rel="alternate"]')
      .map((link) => [
        link.getAttribute('type'),
        link.getAttribute('href'),
        link.getAttribute('title'),
      ]),
    [
      ['application/atom+xml', '/feed.xml', 'Decision Records (Atom)'],
      ['application/rss+xml', '/rss.xml', 'Decision Records (RSS)'],
    ],
  );
});

test('site options reach both feeds', async () => {
  const pages = await build({
    plugin: {
      dirs: { decisions: 'adrs' },
      site: { legalName: 'Example, Inc.', license: 'MIT', language: 'fr-CA' },
      feeds: [{ type: 'rss', path: '/rss.xml' }],
    },
  });
  const { feed } = feedParser.parse(byUrl(pages, '/feed.xml')[0].content);
  const { channel } = feedParser.parse(byUrl(pages, '/rss.xml')[0].content).rss;
  assert.equal(feed['xml:lang'], 'fr-CA');
  assert.equal(channel.language, 'fr-CA');
  assert.match(feed.rights, /^\d{4} Example, Inc\. MIT\.$/);
  assert.match(channel.copyright, /^\d{4} Example, Inc\. MIT\.$/);
});

test('invalid feeds fail the build', async () => {
  const withFeeds = (feeds) =>
    build({ plugin: { dirs: { decisions: 'adrs' }, feeds } });
  await assert.rejects(withFeeds([{ type: 'rss' }]), /must be a path/);
  await assert.rejects(
    withFeeds([{ type: 'json', path: '/feed.json' }]),
    /must be one of/,
  );
  await assert.rejects(
    withFeeds([{ type: 'atom', path: '/atom.xml' }]),
    /more than once/,
  );
});
