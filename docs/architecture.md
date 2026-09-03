# Architecture

```
adrs/                  # ADR markdown files (source of truth)
src/
  _11ty/               # Eleventy modules (collections, data, filters, passthroughs, plugins, shortcodes)
  _data/               # Global data (site.json, practiceAreas.json)
  _includes/           # Nunjucks templates and partials
  assets/              # Fonts, styles, images, icons, and JS
  index.md             # Homepage
dist/                  # Built site (gitignored)
```

- **Eleventy config**: `.eleventy.js` — sets `src/` as input, `dist/` as output, markdown/HTML templates rendered through Nunjucks. All registration is delegated to `src/_11ty/` module groups (collections, data, filters, passthroughs, plugins, shortcodes), each with an `index.js` that registers its modules
- **ADRs**: `adrs/` at repo root is the source of truth; `src/adrs` is a symlink to `../adrs/` so Eleventy picks them up as content. The `practiceArea` frontmatter field must match a name in `src/_data/practiceAreas.json`
- **Eleventy modules** (`src/_11ty/`):
  - `collections/` — `adrs` (all ADRs, newest first), `topics` (deduplicated, lowercased), `contributors` (deduplicated, sorted)
  - `data/` — global data: default layout `page.njk`, plus `eleventyComputed` that switches ADR markdown files to the `adr.njk` layout
  - `filters/` — date formatting via Temporal polyfill (`dates.js`; relative and absolute formats all render in UTC), `spaceless` string utility (`strings.js`), collection helpers (`collections.js`)
  - `passthroughs/` — copies `src/assets/` to site root and the Orama browser bundle to `/js/orama`
  - `plugins/` — markdown-it with anchor links, bundle plugin with lightningcss minification, TOC (bare-list output, wrapped by `adr.njk`), Atom feed at `/feed.xml` (absolute URLs from `site.url`), syntax highlight
  - `shortcodes/` — SVG icon shortcode (`icons.js`) using `@material-symbols/svg-400`; `oramaIndex` (`search.js`) which serializes the ADR collection into an Orama search database
- **Search**: build-time index via the `oramaIndex` shortcode, emitted as `/searchindex.json` by `src/search_index.njk`; client-side search UI in `src/assets/js/search.js` loads the Orama browser bundle from `/js/orama` and computes relative ages at render (`time-since.js`). Anything interpolated into result markup must be escaped or set via `textContent` — topics and titles come from ADR frontmatter
- **Templates**: `src/_includes/` — `page.njk` (base layout), `adr.njk` (ADR layout with sticky table of contents), `site-nav.njk`, `footer.njk`, `recent-decisions.njk`. Listing pages at `src/` root: `decisions.njk`, `topics.njk`, `practice-areas.njk`, `contributors.njk`, `contributor.njk` (paginated per-contributor pages)
- **Global data**: `src/_data/site.json` (organization, url, title, description, icon), `src/_data/practiceAreas.json` (names + icon identifiers), `src/_data/navigation.json` (primary/utility nav)
- **Static assets**: `src/assets/` (fonts, styles, images, icons, js) — copied to site root. CSS is one file per concern in `src/assets/styles/`; design tokens live in `tokens.css` (semantic aliases like `--color-brand-primary` at the top). `reset.css` uses `all: unset`, so interactive elements rely on the restored global `:focus-visible` outline — don't remove it
- **Output**: `dist/` (gitignored)
