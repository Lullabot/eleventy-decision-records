# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

A GitHub template repo providing an Eleventy (v3) static site for documenting architectural decision records (ADRs). Intended for client projects and agencies to clone via "Use this template". Uses ESM (`"type": "module"`).

## Commands

- `npm run start` / `npm run develop` — local dev server with hot reload
- `npm run build` — build static site to `dist/`
- `npm run lint` — run ESLint + Prettier check
- `npm run lint:fix` — auto-fix lint/format issues

## Architecture

- **Eleventy config**: `.eleventy.js` — sets `src/` as input, `dist/` as output, passes through `src/assets/` to root. Uses markdown-it with anchor links, pluginBundle (with lightningcss minification), TOC, RSS, and syntax highlight plugins. Sets default layout to `page.njk`
- **ADRs**: `adrs/` at repo root is the source of truth for decision records. `src/adrs` is a symlink to `../adrs/` so Eleventy picks them up as content. New ADRs go in `adrs/` using the `YYYYMMDD-url-friendly-name.md` naming convention (see `.template` file)
- **ADR frontmatter**: `date`, `status` (accepted/deprecated), `practiceArea` (one of: Design, Engineering, Project Management, Strategy), `topics` (freeform list), `contributors`, `title`, `context`
- **Eleventy modules**: `src/_11ty/` contains ES modules organized by type, each with an `index.js` that registers all modules with Eleventy
  - `src/_11ty/collections/` — `adrs` (all ADRs, newest first), `topics` (deduplicated, lowercased), `contributors` (deduplicated, sorted)
  - `src/_11ty/filters/` — date formatting (`dates.js`), string utilities (`strings.js`), collection helpers (`collections.js`)
  - `src/_11ty/shortcodes/` — SVG icon shortcode (`icons.js`) using `@material-symbols/svg-400`
- **Templates**: `src/_includes/` — `page.njk` (base layout), `site-nav.njk`, `recent-decisions.njk`
- **Global data**: `src/_data/site.json` (organization, title, description), `src/_data/practiceAreas.json` (fixed set with icon identifiers)
- **Content**: `src/` directory; `src/index.md` is the homepage
- **Static assets**: `src/assets/` (fonts, styles, images) — copied to site root via passthrough copy. CSS is bundled/minified via Eleventy's bundle plugin with lightningcss
- **Output**: `dist/` (gitignored)

## Code Style

- ESLint flat config (`eslint.config.js`) with Prettier integration
- Prettier: single quotes, trailing commas, 80 char width
- Husky pre-commit hook runs `npm run lint` on every commit
- ADR markdown files (`/adrs`) are excluded from Prettier formatting (see `.prettierignore`)

## CI/Deployment

- GitHub Actions: runs lint on PRs (`.github/workflows/eslint.yml`)
- Tugboat previews: Apache-based, builds and serves from `dist/` (`.tugboat/config.yml`)
- Node.js version kept in sync between CI and Tugboat via Renovate custom manager
- Renovate: auto-merges after 3-day stability window, pins GitHub Action digests
