# Development

This repository is an npm package, not a site. There is no dev server or build script at the root — to see the theme rendered, build the fixture site described below.

## Commands

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `npm run lint`     | Run ESLint and Prettier checks      |
| `npm run lint:fix` | Auto-fix lint and formatting issues |

## The Fixture Site

`tests/fixture-site/` is a real consumer project: it has its own `package.json` and Eleventy config, keeps 41 lorem-ipsum decision records in `src/adrs/`, and installs the theme the way anyone else would. It backs both the Playwright suite and Tugboat previews.

```bash
bash bin/prepare-fixture-site.sh          # pack the theme, install it into the site
npm --prefix tests/fixture-site run serve # http://localhost:8181
```

Two details worth knowing before changing any of this:

- The theme is installed **from a packed tarball**, not a `file:` dependency. A `file:` dependency symlinks the working tree, which exercises neither the `files` nor the `exports` field in `package.json` — the two things most likely to break a published package while every local build stays green.
- `prepare-fixture-site.sh` reuses a tarball already sitting in `dist-package/` and only packs when there isn't one. CI packs once in a separate job and passes it along as an artifact, so the suite tests the exact bytes that would be published.
- Eleventy must run with the fixture site as its working directory (hence `npm --prefix`), because the plugin resolves Nunjucks through the consuming project's own Eleventy install.

## Code Style

- ESLint flat config (`eslint.config.js`) with Prettier integration
- Prettier: single quotes, trailing commas, 80 char width; `.njk` files formatted via `prettier-plugin-jinja-template`
- Husky pre-commit hook runs `lint-staged` (ESLint on `.js`, Prettier check on staged `.js/.njk/.json/.md/.css/.yml`)
- Keep inline comments to a minimum — only for genuinely non-obvious code; rationale belongs in commit messages

## Testing

Playwright covers visual regression of the main page types (desktop and mobile Chromium) and functional behaviour of search and the sidebar toggle (Chromium and Firefox), all against the fixture site.

| Command                      | Description                                       |
| ---------------------------- | ------------------------------------------------- |
| `npm test`                   | Run all tests in Docker (consistent rendering)    |
| `npm run test:update`        | Update visual snapshots in Docker                 |
| `npm test -- --tests search` | Run only specs matching a name                    |
| `npm run test:local`         | Run functional tests directly (snapshots skipped) |

Visual baselines live in `tests/visual.spec.js-snapshots/` and must only be generated via Docker (`npm run test:update`) — host-rendered screenshots differ by platform and would churn the baselines. The runner (`bin/run-e2e.sh`) uses the `mcr.microsoft.com/playwright` image matching the installed `@playwright/test` version, and gives both `node_modules` trees their own named volumes so container installs never land in the host working tree.

The fixture records carry fixed dates, so URLs are deterministic. Relative ages ("2 days ago") still move with the real clock, so `tests/screenshot.css` — injected only during screenshots via `expect.toHaveScreenshot.stylePath` — hides them and pins their width. Hiding the text alone is not enough: the element resizes as the string changes, which shifts surrounding pixels and fails the comparison.

> [!NOTE]
> `npm test` with no arguments needs bash 4.4 or newer. On stock macOS bash 3.2 it exits with `test_patterns[@]: unbound variable`, because `set -u` treats an empty array expansion as unset. Passing `--tests <name>` avoids it, and CI is unaffected.

## CI and Deployment

- **Linting** — GitHub Actions runs `npm run lint` on pull requests (`.github/workflows/eslint.yml`).
- **Playwright** — `.github/workflows/playwright.yml` packs the theme in a `package` job, uploads the tarball as an artifact, and the test job downloads it before running the suite in Docker.
- **Tugboat** — Preview environments build the fixture site and serve its `_site/` output (`.tugboat/config.yml`).
- **Renovate** — Manages dependency updates with a 3-day stability window and auto-merge. `ignorePaths` is overridden so `tests/fixture-site/package.json` is not skipped; that pin is what determines which Eleventy version the theme is actually tested against.
