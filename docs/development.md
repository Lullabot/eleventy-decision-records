# Development

This repository is an npm package, not a site. There is no dev server at the root — to see the theme rendered, serve the fixture site described below.

## Commands

| Command            | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `npm start`        | Build, then serve the fixture site with the theme linked |
| `npm run build`    | Compile `src/` into `dist/` (`bin/build.ts`)             |
| `npm run lint`     | Run ESLint, Prettier and `tsc --noEmit`                  |
| `npm run lint:fix` | Auto-fix lint and formatting issues                      |

## The Fixture Site

`tests/fixture-site/` is a real consumer project: it has its own `package.json` and Eleventy config, keeps 41 lorem-ipsum decision records in `src/adrs/`, and installs the theme the way anyone else would. It backs both the Playwright suite and Tugboat previews.

```bash
npm start # http://localhost:8181, also reachable from other machines on port 8181
```

`npm start` builds once and symlinks the working tree into the fixture site (`bin/link-fixture-site.sh`), then runs three processes side by side: `tsc --watch` recompiles the TypeScript into `dist/`, `node bin/build.ts --watch` mirrors the static files (templates, styles, markdown, declarations) into `dist/` as they change, and the fixture serves with `DECISION_RECORDS_DEV=1`. The plugin runs from `dist/`, never from `src/`, so an edit shows up only once one of the two watchers has written it there. Templates, styles and browser scripts hot-reload. A change to the compiled plugin code (`dist/index.js`, `dist/lib/**`) still needs a restart, because Node's ESM loader caches the import.

With `DECISION_RECORDS_DEV` set, and only then, the plugin registers its own directory as a `resetConfig` watch target, so the virtual layouts and pages are re-read rather than served from the copy loaded at startup. Two Eleventy quirks shape how (see `watchTheme` in `src/index.ts`): Eleventy 4 keeps directory targets bare and then rejects every file under them, so the target is a `/**` glob; and Eleventy 3 reports changes outside the project relative to the nearest shared parent without mapping them back, so on 3.x the target is registered a second time in that form.

Under `npm start` those targets are moot, because of a bug in Eleventy 3.1.7's watcher (`@11ty/chokidar-with-glob-support` 1.x): as soon as any watch target starts with `../`, Eleventy passes a relative cwd to chokidar and the wrapper resolves directory paths against the wrong base, so nothing outside the project is watched (on Linux at least). `bin/start.sh` works around it in two steps. The fixture serves with `NODE_OPTIONS=--preserve-symlinks`, so the linked theme resolves inside the fixture's `node_modules` and no target starts with `../`; Eleventy then ignores the theme directory as `node_modules`, so `build.ts --watch` relays every `dist/` change by touching the fixture's `eleventy.config.ts`. A config change triggers the reset and rebuild the watch targets were meant to.

To see the packed build instead, the way tests and consumers do:

```bash
bash bin/prepare-fixture-site.sh          # pack the theme, install it into the site
npm --prefix tests/fixture-site run serve
```

Two details worth knowing before changing any of this:

- The theme is installed **from a packed tarball**, not a `file:` dependency. A `file:` dependency symlinks the working tree, which exercises neither the `files` nor the `exports` field in `package.json` — the two things most likely to break a published package while every local build stays green. Packing runs `prepack`, which rebuilds `dist/`, so the tarball never carries a stale build.
- `link-fixture-site.sh` and `prepare-fixture-site.sh` both install with `--no-save`, so whichever ran last wins and neither touches the fixture's `package.json`. Every test command runs the latter, so a linked checkout is swapped back to the tarball automatically.
- `prepare-fixture-site.sh` reuses a tarball already sitting in `dist-package/` and only packs when there isn't one. CI packs once in a separate job and passes it along as an artifact, so the suite tests the exact bytes that would be published.
- Eleventy must run with the fixture site as its working directory (hence `npm --prefix`), because the plugin resolves Nunjucks through the consuming project's own Eleventy install.

## Code Style

- TypeScript throughout. `tsconfig.json` covers `src/` and is what the build compiles; `tsconfig.check.json` extends it to every other `.ts` file (`bin/`, `tests/`, the Playwright and ESLint configs) for type-checking and linting only. A new `.ts` file outside its `include` globs has to be added there, or ESLint refuses to parse it.
- ESLint flat config (`eslint.config.ts`, loaded through jiti): `@eslint/js` recommended plus typescript-eslint's `recommendedTypeChecked` against `tsconfig.check.json`, with Prettier last. Explicit `any` is an error. `no-floating-promises` allowlists `node:test`'s `test`/`describe`/`it`, since the runner awaits those itself.
- `npm run lint` runs ESLint, `prettier -c .` and `tsc -p tsconfig.check.json --noEmit`, so a type error fails lint locally and in CI.
- Prettier: single quotes, trailing commas, 80 char width; `.njk` files formatted via `prettier-plugin-jinja-template`. `.prettierignore` skips `*.sh` because Prettier has no shell parser.
- Husky pre-commit hook runs `lint-staged` (ESLint on `*.ts`, Prettier check on staged `*.{ts,njk,json,md,css,yml,yaml}`)
- Keep inline comments to a minimum — only for genuinely non-obvious code; rationale belongs in commit messages

## Testing

Playwright covers visual regression of the main page types (desktop and mobile Chromium) and functional behaviour of search and the sidebar toggle (Chromium and Firefox), all against the fixture site. Specs are `tests/*.spec.ts`; `playwright.config.ts` limits `testMatch` to that directory level so the fixture site's `node:test` file is not loaded as a spec.

| Command                      | Description                                       |
| ---------------------------- | ------------------------------------------------- |
| `npm test`                   | Run all tests in Docker (consistent rendering)    |
| `npm run test:update`        | Update visual snapshots in Docker                 |
| `npm test -- --tests search` | Run only specs matching a name                    |
| `npm run test:local`         | Run functional tests directly (snapshots skipped) |
| `npm run test:config`        | Build the fixture under several consumer configs  |

Every test command accepts `ELEVENTY_VERSION`, an npm tag or exact version installed into the fixture for that run in place of the lockfile pin. CI runs the whole job twice, once on the pin and once on `canary`, the 4.x prerelease line. The theme is expected to render identically on both, but only the pinned run blocks a PR; a canary failure shows up in the checks without failing them.

```bash
ELEVENTY_VERSION=canary npm run test:config
ELEVENTY_VERSION=canary npm test
```

The fixture's Eleventy config is `eleventy.config.ts`, and everything that runs it (the fixture's `build` and `serve` scripts, and the Playwright `webServer`) passes `--config=eleventy.config.ts` explicitly: Eleventy 3 only discovers `.js`, `.mjs` and `.cjs` configs on its own, and Node 24 strips the types natively, so the file runs without a compile step.

`tests/accessibility.spec.ts` runs [axe-core](https://github.com/dequelabs/axe-core) against every page type at desktop and mobile widths, plus the expanded menu and the search dialog, checking WCAG 2.2 AA and axe's best-practice rules. The scans go through `checkAccessibility()` from [playwright-drupal](https://lullabot.github.io/playwright-drupal/latest/working-with-tests/accessibility-tests/), which attaches the axe results and a screenshot outlining any violations to the report, and writes a summary to the CI job page. A violation that has to be accepted for now goes in `tests/a11y-baseline.ts` with a reason and a link to the issue that will fix it; anything not listed fails the suite. Each page is also rescanned for colour contrast with every link and button forced into `:hover`, and again into `:focus-visible`, through the DevTools protocol (`CSS.forcePseudoState`), which is why the suite is Chromium only. Those state tests report only what the state introduces; anything already failing at rest belongs to the page's own test. It runs as part of `npm test`; `npm test -- --tests accessibility` runs it alone. On the host, `npm run test:local` works too; there are no snapshots involved.

`tests/fixture-site/config.test.ts` runs under `node --test` and builds the fixture through the Eleventy CLI with generated config files: custom `includes` and `layouts` directories, the default (liquid) markdown engine, and project files overriding a theme page or layout. It catches the class of bug where the theme only works with the fixture's own settings. Each case is a separate process because Eleventy caches layouts per process, which would let one case's result leak into the next. The configs it writes are plain JavaScript strings, and each run passes its own path with `--config`.

Visual baselines live in `tests/visual.spec.ts-snapshots/` and must only be generated via Docker (`npm run test:update`) — host-rendered screenshots differ by platform and would churn the baselines. The runner (`bin/run-e2e.sh`) uses the `mcr.microsoft.com/playwright` image matching the installed `@playwright/test` version, and gives both `node_modules` trees their own named volumes so container installs never land in the host working tree. It also chowns `dist/` back to the host user afterwards, since `prepack` builds it as root inside the container.

The fixture records carry fixed dates, so URLs are deterministic. Relative ages ("2 days ago") still move with the real clock, so `tests/screenshot.css` — injected only during screenshots via `expect.toHaveScreenshot.stylePath` — hides them and pins their width. Hiding the text alone is not enough: the element resizes as the string changes, which shifts surrounding pixels and fails the comparison.

## CI and Deployment

- **Linting** — GitHub Actions runs `npm run lint` on pull requests (`.github/workflows/eslint.yml`), so a PR is type-checked as well as linted.
- **Playwright** — `.github/workflows/playwright.yml` packs the theme in a `package` job (`prepack` builds `dist/`), uploads the tarball as an artifact, and the test job downloads it before running the suite in Docker.
- **Tugboat** — Preview environments build the fixture site and serve its `_site/` output (`.tugboat/config.yml`).
- **Renovate** — Manages dependency updates with a 3-day stability window and auto-merge. `ignorePaths` is overridden so `tests/fixture-site/package.json` is not skipped; that pin is what determines which Eleventy version the theme is actually tested against.
- **Conventional commits** — PRs are squash-merged with the PR title as the commit message, so `.github/workflows/conventional-commits.yml` requires the title to follow [Conventional Commits](https://www.conventionalcommits.org/). Mark breaking changes with `!` (`feat!: …`); the squash commit has no body, so a `BREAKING CHANGE:` footer is dropped.
- **Releases** — On every push to `main`, `.github/workflows/release-please.yml` reruns lint and Playwright, then [release-please](https://github.com/googleapis/release-please) opens or updates a release PR that bumps the version and changelog. Merging that PR tags the release and publishes it to npm through [trusted publishing](https://docs.npmjs.com/trusted-publishers), so no npm token is stored in the repository.
