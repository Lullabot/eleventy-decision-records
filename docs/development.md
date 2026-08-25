# Development

## Commands

| Command                  | Description                                   |
| ------------------------ | --------------------------------------------- |
| `npm run start`          | Start local dev server with hot reload        |
| `npm run build`          | Build the static site to `dist/`              |
| `npm run lint`           | Run ESLint and Prettier checks                |
| `npm run lint:fix`       | Auto-fix lint and formatting issues           |
| `npm run sample-content` | Generate lorem-ipsum sample ADRs into `adrs/` |

Notes:

- The dev server does not reload changes to `src/_11ty/` modules or `.eleventy.js` — restart it after config-level edits.
- Sample ADR filenames from `npm run sample-content` are date-relative to the build time, so never reference them in config or tests.
- This template repo gitignores `adrs/*.md` so generated sample ADRs are never committed (only the `.template` file is tracked). Consumers of the template are expected to remove that ignore line; see [Writing ADRs](writing-adrs.md).

## Code Style

- ESLint flat config (`eslint.config.js`) with Prettier integration
- Prettier: single quotes, trailing commas, 80 char width; `.njk` files formatted via `prettier-plugin-jinja-template`
- Husky pre-commit hook runs `lint-staged` (ESLint on `.js`, Prettier check on staged `.js/.njk/.json/.md/.css/.yml`)
- ADR markdown files (`/adrs`) are excluded from Prettier formatting (see `.prettierignore`)
- Keep inline comments to a minimum — only for genuinely non-obvious code; rationale belongs in commit messages

## CI and Deployment

- **Linting** — GitHub Actions runs `npm run lint` on pull requests (`.github/workflows/eslint.yml`).
- **Tugboat** — Preview environments build and serve from `dist/` (`.tugboat/config.yml`).
- **Renovate** — Manages dependency updates with a 3-day stability window and auto-merge.

## Testing

Playwright covers visual regression of the main page types (desktop and mobile
Chromium) and functional behavior of search and the sidebar toggle (Chromium
and Firefox). Test content is generated with a pinned `SAMPLE_CONTENT_TODAY`
date so URLs are deterministic; `<time>` elements are masked in screenshots
because relative ages drift with the build clock.

| Command                      | Description                                       |
| ---------------------------- | ------------------------------------------------- |
| `npm test`                   | Run all tests in Docker (consistent rendering)    |
| `npm run test:update`        | Update visual snapshots in Docker                 |
| `npm test -- --tests search` | Run only specs matching a name                    |
| `npm run test:local`         | Run functional tests directly (snapshots skipped) |

Visual baselines live in `tests/visual.spec.js-snapshots/` and must only be
generated via Docker (`npm run test:update`) — host-rendered screenshots
differ by platform and would churn the baselines. The runner
(`bin/run-e2e.sh`) uses the `mcr.microsoft.com/playwright` image matching the
installed `@playwright/test` version.
