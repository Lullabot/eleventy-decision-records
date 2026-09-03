import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

import collections from './lib/collections/index.js';
import data from './lib/data/index.js';
import filters from './lib/filters/index.js';
import plugins from './lib/plugins/index.js';
import shortcodes from './lib/shortcodes/index.js';
import themeConfig from './config.js';

const themeRoot = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

/**
 * Resolves the on-disk root of an installed package, regardless of
 * whether its export map exposes package.json.
 */
function packageRoot(name, probe = name) {
  const entry = require.resolve(probe);
  const marker = join('node_modules', ...name.split('/'));
  return entry.slice(0, entry.indexOf(marker) + marker.length);
}

/**
 * Loads the same Nunjucks copy the project's Eleventy uses. Each copy
 * carries its own SafeString class, so an environment built from the
 * theme's own copy makes `{{ content | safe }}` fail Eleventy's
 * `instanceof` check and every page renders double-escaped.
 */
function projectNunjucks() {
  const projectRequire = createRequire(join(process.cwd(), 'package.json'));
  const eleventyRequire = createRequire(
    projectRequire.resolve('@11ty/eleventy'),
  );
  return eleventyRequire('nunjucks');
}

/**
 * Pages the theme provides. Each is registered as a virtual template
 * unless the project has a real file at the same input path.
 */
const PAGES = [
  'decisions.njk',
  'topics.njk',
  'practice-areas.njk',
  'contributors.njk',
  'contributor.njk',
  'favicon.njk',
  'search_index.njk',
];

/**
 * Layouts the theme provides, registered as virtual templates in the
 * includes directory unless the project overrides them on disk.
 */
const LAYOUTS = ['page.njk', 'adr.njk'];

export default function (eleventyConfig, options = {}) {
  const opts = themeConfig(options);

  const inputDir = eleventyConfig.directories?.input ?? './src/';
  const includesDir =
    eleventyConfig.directories?.includes ?? './src/_includes/';

  opts.iconDirs = [
    ...(options.iconDirs ?? [join(inputDir, 'assets/icons')]),
    join(themeRoot, 'assets/icons'),
    join(
      packageRoot(
        '@material-symbols/svg-400',
        '@material-symbols/svg-400/rounded/search.svg',
      ),
      'rounded',
    ),
  ];

  eleventyConfig.addGlobalData('site', opts.site);
  eleventyConfig.addGlobalData('navigation', opts.navigation);
  eleventyConfig.addGlobalData('practiceAreas', opts.practiceAreas);

  // Nunjucks resolves includes from the project first, then the theme,
  // so any theme partial or stylesheet can be overridden by creating a
  // file of the same name in the project's includes directory.
  const searchPaths = [
    includesDir,
    join(themeRoot, 'templates/partials'),
    join(themeRoot, 'assets'),
  ].filter(existsSync);
  const Nunjucks = projectNunjucks();
  eleventyConfig.setLibrary(
    'njk',
    new Nunjucks.Environment(
      new Nunjucks.FileSystemLoader(searchPaths, { noCache: true }),
    ),
  );

  collections(eleventyConfig, join(inputDir, 'adrs/*.md'));
  data(eleventyConfig);
  filters(eleventyConfig);
  plugins(eleventyConfig, opts);
  shortcodes(eleventyConfig, opts);

  // Theme assets copy file-by-file so a project file at the same path
  // under src/assets/ replaces the theme's copy instead of colliding.
  const projectAssets = join(inputDir, 'assets');
  const themeAssets = join(themeRoot, 'assets');
  for (const entry of readdirSync(themeAssets, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile()) continue;
    const rel = relative(themeAssets, join(entry.parentPath, entry.name));
    if (existsSync(join(projectAssets, rel))) continue;
    eleventyConfig.addPassthroughCopy({
      [relative('.', join(themeAssets, rel))]: `/${rel}`,
    });
  }
  if (existsSync(projectAssets)) {
    eleventyConfig.addPassthroughCopy({ [projectAssets]: '/' });
  }
  eleventyConfig.addPassthroughCopy({
    [relative('.', join(packageRoot('@orama/orama'), 'dist/browser'))]:
      '/js/orama',
  });

  eleventyConfig.addWatchTarget(relative('.', themeRoot));

  for (const name of LAYOUTS) {
    if (!existsSync(join(includesDir, name))) {
      eleventyConfig.addTemplate(
        join('_includes', name),
        readFileSync(join(themeRoot, 'templates/layouts', name), 'utf8'),
      );
    }
  }

  for (const name of PAGES) {
    if (!existsSync(join(inputDir, name))) {
      eleventyConfig.addTemplate(
        name,
        readFileSync(join(themeRoot, 'templates/pages', name), 'utf8'),
      );
    }
  }
}
