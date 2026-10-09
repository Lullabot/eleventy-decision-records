import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { parse } from 'node-html-parser';

// Paths below are relative to the fixture site, wherever the runner started.
process.chdir(import.meta.dirname);

const ELEVENTY = 'node_modules/@11ty/eleventy/cmd.cjs';

const FIXTURE_INPUT = 'src';
const NJK = { markdownTemplateEngine: 'njk', htmlTemplateEngine: 'njk' };

const scratch = [];
after(() => {
  for (const dir of scratch) rmSync(dir, { recursive: true, force: true });
});

// Created inside the fixture site so the config file resolves the packed
// theme from the fixture's node_modules and Eleventy sees a relative path.
function scratchDir() {
  const dir = mkdtempSync('.config-test-');
  scratch.push(dir);
  return dir;
}

// A copy of the fixture input with extra files layered on top.
function inputWith(files) {
  const dir = scratchDir();
  cpSync(FIXTURE_INPUT, dir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), content);
  }
  return dir;
}

// Each case runs the CLI against a generated config file. The programmatic
// API ignores its config callback's return value, and Eleventy's module-level
// caches would let one case's layouts leak into the next within a process.
async function build({
  input = FIXTURE_INPUT,
  dir = {},
  engines = NJK,
  plugin = { dirs: { decisions: 'adrs' } },
} = {}) {
  const configPath = join(scratchDir(), 'eleventy.config.js');
  writeFileSync(
    configPath,
    `import decisionRecords from '@lullabot/eleventy-decision-records';
export default function (eleventyConfig) {
  eleventyConfig.addPlugin(decisionRecords, ${JSON.stringify(plugin)});
  return ${JSON.stringify({ ...engines, dir: { input, ...dir } })};
}
`,
  );
  const { stdout } = await promisify(execFile)(
    process.execPath,
    [ELEVENTY, `--config=${configPath}`, '--to=json', '--quiet'],
    { maxBuffer: 64 * 1024 * 1024 },
  );
  return JSON.parse(stdout);
}

const byUrl = (pages, url) => pages.filter((p) => p.url === url);
const adrPages = (pages) => pages.filter((p) => /^\/adrs\/\d{8}-/.test(p.url));

function assertThemeSite(pages) {
  assert.equal(byUrl(pages, '/').length, 1);
  assert.equal(byUrl(pages, '/about/').length, 1);
  assert.equal(byUrl(pages, '/adrs/').length, 1);
  assert.equal(byUrl(pages, '/feed.xml').length, 1);
  const adrs = adrPages(pages);
  assert.ok(adrs.length > 0, 'no ADR pages rendered');
  for (const page of adrs) {
    assert.match(page.content, /class="adr-detail-meta"/, page.url);
  }
  for (const page of pages) {
    assert.doesNotMatch(page.content, /{[{%]/, `${page.url} has raw tags`);
  }
}

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

test(
  'decisions directory with a trailing slash',
  { skip: 'dirs.decisions is not normalized yet' },
  async () => {
    assertThemeSite(await build({ plugin: { dirs: { decisions: 'adrs/' } } }));
  },
);

test('site icon links to the organization homepage', async () => {
  const logo = (pages) =>
    parse(byUrl(pages, '/')[0].content)
      .querySelector('.site-nav > a')
      .getAttribute('href');

  assert.equal(logo(await build()), 'https://www.lullabot.com/');
  const plugin = { dirs: { decisions: 'adrs' }, site: { homepage: '' } };
  assert.equal(logo(await build({ plugin })), '/');
});
