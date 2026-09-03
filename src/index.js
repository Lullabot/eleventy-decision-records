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
 * Adds the theme's template directories to the Nunjucks environment
 * Eleventy builds for the project.
 *
 * The theme deliberately extends that environment rather than supplying
 * one of its own. Constructing an environment here would mean loading a
 * second copy of Nunjucks, which will conflict with Eleventy's.
 *
 * Eleventy's own search paths (the project's includes directory, then
 * its working directory) stay ahead of the theme's, so a project file
 * of the same name still takes precedence.
 */
function addThemeSearchPaths(eleventyConfig, searchPaths) {
  eleventyConfig.on('eleventy.engine.njk', ({ environment }) => {
    for (const loader of environment.loaders ?? []) {
      if (Array.isArray(loader.searchPaths)) {
        loader.searchPaths.push(...searchPaths);
      }
    }
  });
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
];

/**
 * Layouts the theme provides, registered as virtual templates in the
 * includes directory unless the project overrides them on disk.
 */
const LAYOUTS = ['page.njk', 'adr.njk'];

const ASSETS = ['favicon.njk', 'search_index.njk'];

/**
 * Default content the theme ships so a fresh project has a homepage and
 * an about page. These live at the theme root rather than under
 * templates/ because they are prose a project is expected to replace.
 */
const CONTENT = ['index.md', 'about.md'];

/**
 * Extensions Eleventy will render a page from, used to decide whether a
 * project already provides its own version of a theme page.
 */
const TEMPLATE_EXTENSIONS = ['md', 'njk', 'html', 'liquid', '11ty.js'];

/**
 * True when the project has its own template that would take the theme
 * page's place. The extension is ignored so a project's about.njk
 * replaces the theme's about.md rather than fighting it for /about/.
 */
function hasOverride(dir, name) {
  const base = name.slice(0, name.indexOf('.'));
  return TEMPLATE_EXTENSIONS.some((ext) =>
    existsSync(join(dir, `${base}.${ext}`)),
  );
}

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
  eleventyConfig.addGlobalData('dirs', opts.dirs);

  // Nunjucks resolves includes from the project first, then the theme,
  // so any theme partial or stylesheet can be overridden by creating a
  // file of the same name in the project's includes directory.
  addThemeSearchPaths(eleventyConfig, [
    join(themeRoot, 'templates/partials'),
    join(themeRoot, 'assets'),
  ]);

  collections(eleventyConfig, join(inputDir, opts.dirs.decisions, '*.md'));
  data(eleventyConfig, opts.dirs.decisions);
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
    if (!hasOverride(inputDir, name)) {
      eleventyConfig.addTemplate(
        name,
        readFileSync(join(themeRoot, 'templates/pages', name), 'utf8'),
      );
    }
  }

  for (const name of CONTENT) {
    if (!hasOverride(inputDir, name)) {
      eleventyConfig.addTemplate(
        name,
        readFileSync(join(themeRoot, name), 'utf8'),
      );
    }
  }

  for (const name of ASSETS) {
    if (!hasOverride(inputDir, name)) {
      eleventyConfig.addTemplate(
        name,
        readFileSync(join(themeRoot, 'templates/assets', name), 'utf8'),
      );
    }
  }
}
