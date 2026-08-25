# Customizing for Your Organization

## Site Metadata

Edit `src/_data/site.json` to set your organization name, site title, and description:

```json
{
  "organization": "Your Organization",
  "url": "https://decisions.example.com/",
  "title": "Decision Records",
  "description": "Documented architectural decisions for your team",
  "icon": "brand_family-fill"
}
```

The `icon` value is a [Material Symbols](https://fonts.google.com/icons) icon identifier used in the site header. The `url` is the production base URL, used to build absolute links in the Atom feed at `/feed.xml`.

## Practice Areas

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

## Branding and Styles

- **Colors and design tokens** — Edit `src/assets/styles/tokens.css` to update the color palette, typography, spacing, and other design tokens. The semantic aliases at the top (e.g., `--color-brand-primary`) are the quickest way to change the look.
- **Fonts** — Replace the font files in `src/assets/fonts/` and update `src/assets/styles/fonts.css` with your `@font-face` declarations. Then update the `--font-family-base` token in `tokens.css`.
- **Images** — Replace the header images in `src/assets/images/`.
- **Icons** — Custom icons can be added to `src/assets/icons`. Icon usage can be used in templates with `{% icon "icon-name" %}`. Custom icons are resolved first, then fallback to `node_modules/@material-symbols`.

## Homepage

Edit `src/index.md` to customize the landing page content.
