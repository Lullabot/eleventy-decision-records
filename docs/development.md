# Development

This repository is an npm package, not a site. There is no dev server or build script at the root — to see the theme rendered, build the fixture site described below.

## Commands

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm start`        | Serve the fixture site with the theme linked |
| `npm run lint`     | Run ESLint and Prettier checks               |
| `npm run lint:fix` | Auto-fix lint and formatting issues          |

## The Fixture Site

`tests/fixture-site/` is a real consumer project: it has its own `package.json` and Eleventy config, keeps 41 lorem-ipsum decision records in `src/adrs/`, and installs the theme the way anyone else would. It backs both the Playwright suite and Tugboat previews.

```bash
npm start # http://localhost:8181, also reachable from other machines on port 8181
```

`npm start` symlinks the working tree into the fixture site (`bin/link-fixture-site.sh`) and serves it with `DECISION_RECORDS_DEV=1`. Edits under `src/` rebuild and the dev server hot-swaps the page. With that variable set, and only then, the plugin registers its own directory as a `resetConfig` watch target, so the virtual layouts and pages are re-read rather than served from the copy loaded at startup. Two Eleventy quirks shape how (see `watchTheme` in `src/index.js`): Eleventy 4 keeps directory targets bare and then rejects every file under them, so the target is a `/**` glob; and Eleventy 3 reports changes outside the project relative to the nearest shared parent without mapping them back, so on 3.x the target is registered a second time in that form.

To see the packed build instead, the way tests and consumers do:

```bash
bash bin/prepare-fixture-site.sh          # pack the theme, install it into the site
npm --prefix tests/fixture-site run serve
```

Two details worth knowing before changing any of this:

- The theme is installed **from a packed tarball**, not a `file:` dependency. A `file:` dependency symlinks the working tree, which exercises neither the `files` nor the `exports` field in `package.json` — the two things most likely to break a published package while every local build stays green.
- `link-fixture-site.sh` and `prepare-fixture-site.sh` both install with `--no-save`, so whichever ran last wins and neither touches the fixture's `package.json`. Every test command runs the latter, so a linked checkout is swapped back to the tarball automatically.
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
| `npm run test:config`        | Build the fixture under several consumer configs  |
| `npm run test:a11y`          | Run the axe accessibility suite in Docker         |

Every test command accepts `ELEVENTY_VERSION`, an npm tag or exact version installed into the fixture for that run in place of the lockfile pin. CI runs the whole job twice, once on the pin and once on `canary`, the 4.x prerelease line. The theme is expected to render identically on both, but only the pinned run blocks a PR; a canary failure shows up in the checks without failing them.

```bash
ELEVENTY_VERSION=canary npm run test:config
ELEVENTY_VERSION=canary npm test
```

`tests/accessibility.spec.js` runs [axe-core](https://github.com/dequelabs/axe-core) against every page type at desktop and mobile widths, plus the expanded menu and the search dialog, checking WCAG 2.2 AA. Each page is also rescanned for colour contrast with every link and button forced into `:hover`, and again into `:focus-visible`, through the DevTools protocol (`CSS.forcePseudoState`), which is why the suite is Chromium only. Those state tests report only what the state introduces; anything already failing at rest belongs to the page's own test. It is opt-in (`E2E_A11Y=1`, or `npm run test:a11y`) and CI runs it as a job that cannot block a PR, because the current design has known contrast and icon-labelling failures. Once those are fixed, fold it into the default run by dropping the `E2E_A11Y` switch in `playwright.config.js`. On the host, `E2E_A11Y=1 npm run test:local` works too; there are no snapshots involved.

`tests/fixture-site/config.test.js` builds the fixture through the Eleventy CLI with generated config files: custom `includes` and `layouts` directories, the default (liquid) markdown engine, and project files overriding a theme page or layout. It catches the class of bug where the theme only works with the fixture's own settings. Each case is a separate process because Eleventy caches layouts per process, which would let one case's result leak into the next.

Visual baselines live in `tests/visual.spec.js-snapshots/` and must only be generated via Docker (`npm run test:update`) — host-rendered screenshots differ by platform and would churn the baselines. The runner (`bin/run-e2e.sh`) uses the `mcr.microsoft.com/playwright` image matching the installed `@playwright/test` version, and gives both `node_modules` trees their own named volumes so container installs never land in the host working tree.

The fixture records carry fixed dates, so URLs are deterministic. Relative ages ("2 days ago") still move with the real clock, so `tests/screenshot.css` — injected only during screenshots via `expect.toHaveScreenshot.stylePath` — hides them and pins their width. Hiding the text alone is not enough: the element resizes as the string changes, which shifts surrounding pixels and fails the comparison.

## CI and Deployment

- **Linting** — GitHub Actions runs `npm run lint` on pull requests (`.github/workflows/eslint.yml`).
- **Playwright** — `.github/workflows/playwright.yml` packs the theme in a `package` job, uploads the tarball as an artifact, and the test job downloads it before running the suite in Docker.
- **Tugboat** — Preview environments build the fixture site and serve its `_site/` output (`.tugboat/config.yml`).
- **Renovate** — Manages dependency updates with a 3-day stability window and auto-merge. `ignorePaths` is overridden so `tests/fixture-site/package.json` is not skipped; that pin is what determines which Eleventy version the theme is actually tested against.
