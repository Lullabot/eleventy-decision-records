# eleventy-decision-records

An [Eleventy](https://www.11ty.dev/) (v3) starter project for documenting architectural decision records (ADRs).

Click the **"Use this template"** button to get started.

## Getting Started

```bash
npm install
npm run start
```

This launches a local dev server with hot reload at `http://localhost:8080`.

After cloning the template, remove the `adrs/*.md` line from `.gitignore` so your ADR files can be committed to version control.

### Available Commands

| Command            | Description                            |
| ------------------ | -------------------------------------- |
| `npm run start`    | Start local dev server with hot reload |
| `npm run build`    | Build the static site to `dist/`       |
| `npm run lint`     | Run ESLint and Prettier checks         |
| `npm run lint:fix` | Auto-fix lint and formatting issues    |

## Customizing for Your Organization

### 1. Site Metadata

Edit `src/_data/site.json` to set your organization name, site title, and description:

```json
{
  "organization": "Your Organization",
  "title": "Decision Records",
  "description": "Documented architectural decisions for your team",
  "icon": "brand_family-fill"
}
```

The `icon` value is a [Material Symbols](https://fonts.google.com/icons) icon identifier used in the site header.

### 2. Practice Areas

Edit `src/_data/practiceAreas.json` to define the categories that ADRs can be grouped by. Each practice area has a name and a Material Symbols icon:

```json
[
  { "name": "Project Management", "icon": "checklist" },
  { "name": "Strategy", "icon": "lightbulb" },
  { "name": "Design", "icon": "design_services" },
  { "name": "Engineering", "icon": "engineering" }
]
```

Add, remove, or rename practice areas to match your team's structure. When writing ADRs, the `practiceArea` frontmatter field must match one of these names exactly.

### 3. Branding and Styles

- **Colors and design tokens** — Edit `src/assets/styles/tokens.css` to update the color palette, typography, spacing, and other design tokens. The semantic aliases at the top (e.g., `--color-brand-primary`) are the quickest way to change the look.
- **Fonts** — Replace the font files in `src/assets/fonts/` and update `src/assets/styles/fonts.css` with your `@font-face` declarations. Then update the `--font-family-base` token in `tokens.css`.
- **Images** — Replace the header images in `src/assets/images/`.

### 4. Homepage

Edit `src/index.md` to customize the landing page content.

## Writing ADRs

ADRs live in the `adrs/` directory at the repository root. To create a new one:

1. Copy the template: `adrs/YYYYMMDD-url-friendly-name.md.template`
2. Rename it with today's date and a descriptive slug, e.g., `adrs/20260313-adopt-graphql.md`
3. Fill in the frontmatter fields:

| Field          | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| `date`         | The decision date (`YYYY-MM-DD`)                             |
| `status`       | `accepted` or `deprecated`                                   |
| `practiceArea` | Must match a name in `practiceAreas.json`                    |
| `topics`       | Freeform list of tags (e.g., `development`, `testing`)       |
| `contributors` | People involved in the decision, sorted alphabetically       |
| `title`        | A concise statement of the decision                          |
| `context`      | One or two sentences explaining why this decision was needed |

4. Write the body using `## Decision` and `## Consequences` sections (headings appear in the table of contents).

## Project Structure

```
adrs/                  # ADR markdown files (source of truth)
src/
  _11ty/               # Eleventy modules (collections, filters, shortcodes)
  _data/               # Global data (site.json, practiceAreas.json)
  _includes/           # Nunjucks templates and partials
  assets/              # Fonts, styles, and images
  index.md             # Homepage
dist/                  # Built site (gitignored)
```

## CI and Deployment

- **Linting** — GitHub Actions runs `npm run lint` on pull requests (`.github/workflows/eslint.yml`).
- **Tugboat** — Preview environments build and serve from `dist/` (`.tugboat/config.yml`).
- **Renovate** — Manages dependency updates with a 3-day stability window and auto-merge.

## License

See [LICENSE](LICENSE) for details.
