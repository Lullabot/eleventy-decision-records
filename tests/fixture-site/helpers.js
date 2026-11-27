import { after } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

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
export function scratchDir() {
  const dir = mkdtempSync('.config-test-');
  scratch.push(dir);
  return dir;
}

// A copy of the fixture input with extra files layered on top.
export function inputWith(files) {
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
export async function build({
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

export const byUrl = (pages, url) => pages.filter((p) => p.url === url);
export const adrPages = (pages) =>
  pages.filter((p) => /^\/adrs\/\d{8}-/.test(p.url));

export function assertThemeSite(pages) {
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
