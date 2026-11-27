import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { parse } from 'node-html-parser';
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

test('feed lists each record with its summary and categories', async () => {
  const atom = byUrl(await build(), '/feed.xml')[0].content;
  assert.match(atom, /^<\?xml /);
  assert.match(atom, /<link href="https:\/\/[^"]+\/feed\.xml" rel="self" \/>/);
  assert.match(atom, /<summary>Exercises the prose styles/);
  assert.match(atom, /<rights>\d{4} Lullabot, Inc\. CC-BY 4\.0\.<\/rights>/);
  assert.match(
    atom,
    /<category term="lorem" scheme="https:\/\/[^"]+\/topics\/" \/>/,
  );
  assert.match(
    atom,
    /<category term="Design" scheme="https:\/\/[^"]+\/practice-areas\/" \/>/,
  );
  assert.doesNotMatch(atom, /<category term="accepted" \/>/);
  assert.match(atom, /<title>\[deprecated\] Faucibus scelerisque/);
  const updated = [...atom.matchAll(/<entry>[\s\S]*?<updated>([^<]+)/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(updated, updated.toSorted().reverse(), 'newest first');
  assert.match(atom, /<feed [^>]*xml:lang="en-US"/);

  const plugin = {
    dirs: { decisions: 'adrs' },
    site: { legalName: 'Example, Inc.', license: 'MIT', language: 'fr-CA' },
    feeds: [{ type: 'rss', path: '/rss.xml' }],
  };
  const pages = await build({ plugin });
  assert.equal(byUrl(pages, '/feed.xml').length, 1);
  const rss = byUrl(pages, '/rss.xml')[0].content;
  assert.match(rss, /^<\?xml [^>]+>\n<rss version="2.0"/);
  assert.match(rss, /<atom:link href="https:\/\/[^"]+\/rss\.xml"/);
  assert.match(rss, /<language>fr-CA<\/language>/);
  assert.match(rss, /<copyright>\d{4} Example, Inc\. MIT\.<\/copyright>/);
  assert.match(rss, /<description>Exercises the prose styles/);
  assert.match(rss, /<category domain="topic">lorem<\/category>/);
  assert.doesNotMatch(rss, /<category domain="status">/);
  assert.match(rss, /<title>\[deprecated\] Faucibus scelerisque/);
  const home = parse(byUrl(pages, '/')[0].content);
  assert.equal(home.querySelector('html').getAttribute('lang'), 'fr-CA');
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
