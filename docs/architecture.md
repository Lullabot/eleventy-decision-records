# Architecture

```
src/
  index.js             # Plugin entrypoint — everything is registered from here
  config.js            # Merges project options over the defaults
  defaultConfig.json   # Default site, navigation, practiceAreas, dirs
  index.md             # Default homepage (content, not a template)
  about.md             # Default about page
  YYYYMMDD-decision-template.md
  lib/                 # collections, data, filters, plugins, shortcodes
  templates/
    layouts/           # page.njk, adr.njk
    pages/             # decisions, topics, practice-areas, contributors, contributor
    partials/          # site-nav, footer, recent-decisions
    assets/            # favicon.njk, search_index.njk
  assets/              # fonts, icons, images, js, styles
tests/
  fixture-site/        # A consumer project; the only site this repo builds
  *.spec.js            # Playwright specs
bin/                   # Fixture-site install and Dockerised test runner
```

This repository is the package, not a site: there is no Eleventy config, input directory, or build script at the root.

## The plugin entrypoint

`src/index.js` receives Eleventy's config object and the project's options, and does everything from there. It reads the project's own directories (`eleventyConfig.directories.input` / `.includes`) rather than assuming any layout, so the theme adapts to wherever the consumer keeps its content.

- **Configuration** — `config.js` merges the project's options over `defaultConfig.json` using `@11ty/eleventy-utils`: objects deep-merge, arrays concatenate, and an `override:` key prefix replaces rather than merges. It also rewrites the `{decisions}` token in navigation URLs to the configured decisions directory. The resolved config is exposed as the `site`, `navigation`, `practiceAreas`, and `dirs` global data.
- **Nunjucks environment** — the plugin installs its own Nunjucks environment whose search paths are the project's includes directory first, then the theme's `templates/partials/` and `assets/`. That ordering is what makes partials and stylesheets overridable. Nunjucks is deliberately loaded through the _project's_ Eleventy (`projectNunjucks()`) rather than imported directly: two copies of Nunjucks carry two `SafeString` classes, and a mismatch makes `{{ content | safe }}` fail its `instanceof` check, double-escaping every page.
- **Passthrough copying** — theme assets are copied file by file, skipping any path the project already has under its own `assets/`, so a project file replaces the theme's rather than colliding with it. The project's `assets/` is then copied wholesale, plus the Orama browser bundle to `/js/orama`.

## Eleventy modules (`src/lib/`)

- `collections/` — `adrs` (newest first), `topics` (deduplicated, lowercased), `contributors` (deduplicated, sorted). All three are built from a single glob derived from `dirs.decisions`, so moving the records moves every collection with them
- `data/` — default layout `page.njk`, plus an `eleventyComputed` rule that switches markdown files inside the decisions directory to `adr.njk`
- `filters/` — date formatting via the Temporal polyfill (`dates.js`; relative and absolute formats all render in UTC), collection helpers (`collections.js`), `spaceless` (`strings.js`)
- `plugins/` — markdown-it with anchor links, bundle plugin with lightningcss minification, TOC (bare-list output, wrapped by `adr.njk`), Atom feed at `/feed.xml` (absolute URLs from `site.url`), syntax highlighting
- `shortcodes/` — `icon`/`favicon` (`icons.js`), resolved against the project's icon directory, then the theme's, then `@material-symbols/svg-400`; `oramaIndex` (`search.js`), which serializes the ADR collection into an Orama database

## What the theme provides, and how projects override it

Everything the theme ships is registered as an Eleventy _virtual_ template, and every one of them steps aside if the project provides its own. There are four groups, each with a slightly different override rule:

| Group   | Source                 | Overridden by                                         |
| ------- | ---------------------- | ----------------------------------------------------- |
| Layouts | `templates/layouts/`   | A file of the same name in the project's includes dir |
| Pages   | `templates/pages/`     | A file of the same base name, any template extension  |
| Content | `index.md`, `about.md` | A file of the same base name, any template extension  |
| Assets  | `templates/assets/`    | A file of the same base name, any template extension  |

The extension is ignored for all but layouts, so a project's `about.njk` replaces the theme's `about.md` instead of fighting it for the same output path. Partials and stylesheets are not virtual templates — they are overridden through the Nunjucks search path order described above.

Content (`index.md`, `about.md`) lives at the package root rather than under `templates/` because it is prose a project is expected to replace, not structure.

## Search

The index is built at build time by the `oramaIndex` shortcode and emitted as `/searchindex.json` by `templates/assets/search_index.njk`. The client-side UI in `assets/js/search.js` loads the Orama browser bundle from `/js/orama` and computes relative ages at render time (`time-since.js`). Anything interpolated into result markup must be escaped or set via `textContent` — topics and titles come from ADR frontmatter.

## Styles

CSS is one file per concern in `assets/styles/`; design tokens live in `tokens.css`, with semantic aliases like `--color-brand-primary` at the top. `reset.css` uses `all: unset`, so interactive elements rely on the restored global `:focus-visible` outline — don't remove it.
