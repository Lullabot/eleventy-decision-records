# Customizing for Your Organization

Everything is configured through the options object passed to `addPlugin`. Your options are merged over the theme's defaults, so you only need to supply what you want to change:

```js
eleventyConfig.addPlugin(decisionRecords, {
  site: {
    organization: 'Your Organization',
    url: 'https://decisions.example.com/',
  },
});
```

Merge behaviour comes from `@11ty/eleventy-utils`: objects merge deeply, and **arrays concatenate**. To replace a default array rather than append to it, prefix the key with `override:`:

```js
eleventyConfig.addPlugin(decisionRecords, {
  // Appends to the four default practice areas.
  practiceAreas: [{ name: 'Accessibility', icon: 'accessibility' }],
  // Replaces them outright.
  'override:practiceAreas': [{ name: 'Accessibility', icon: 'accessibility' }],
});
```

## Site Metadata

```js
eleventyConfig.addPlugin(decisionRecords, {
  site: {
    organization: 'Your Organization',
    url: 'https://decisions.example.com/',
    legalName: 'Your Organization, Inc.',
    title: 'Decision Records',
    description: 'Documented architectural decisions for your team',
    icon: 'brand_family-fill',
    social: [
      { label: 'RSS', url: '/feed.xml', icon: 'rss_feed' },
      { label: 'GitHub', url: 'https://github.com/your-org', icon: 'github' },
    ],
  },
});
```

`icon` is a [Material Symbols](https://fonts.google.com/icons) identifier used in the site header. `url` is the production base URL, used to build absolute links in the Atom feed at `/feed.xml`. `social` links appear in the footer, and each `icon` resolves the same way as the `{% icon %}` shortcode.

## Navigation

```js
eleventyConfig.addPlugin(decisionRecords, {
  navigation: {
    primary: [
      { label: 'Home', url: '/', icon: 'home-fill' },
      { label: 'All decisions', url: '/{decisions}/', icon: 'verified' },
    ],
    utility: [
      { label: 'Contributors', url: '/contributors/', icon: 'group' },
      { label: 'About', url: '/about/', icon: 'info' },
    ],
  },
});
```

The `{decisions}` token in a URL is replaced with your configured decisions directory, so the link follows if you move your records.

## Practice Areas

```js
eleventyConfig.addPlugin(decisionRecords, {
  'override:practiceAreas': [
    { name: 'Project Management', icon: 'checklist' },
    { name: 'Strategy', icon: 'lightbulb' },
    { name: 'Design', icon: 'design_services' },
    { name: 'Engineering', icon: 'settings' },
  ],
});
```

The `practiceArea` frontmatter field in each ADR must match one of these names exactly. The example uses `override:` because arrays otherwise concatenate — without it you would end up with these _plus_ the four defaults.

## Where Records Live

By default the theme looks for `<input>/decisions/*.md`. To use a different directory name:

```js
eleventyConfig.addPlugin(decisionRecords, {
  dirs: {
    decisions: 'adrs',
  },
});
```

This moves the source glob, the listing page's URL, the layout assignment, and any navigation URL using the `{decisions}` token — all together.

## Overriding Templates and Partials

Create a file with the same name in your project and the theme's version steps aside:

| To replace                                                                      | Add                                            |
| ------------------------------------------------------------------------------- | ---------------------------------------------- |
| A layout (`page.njk`, `adr.njk`)                                                | The same filename in your includes directory   |
| A page (`decisions`, `topics`, `practice-areas`, `contributors`, `contributor`) | The same base name in your input directory     |
| The homepage or about page                                                      | `index.*` or `about.*` in your input directory |
| A partial (`site-nav`, `footer`, `recent-decisions`)                            | The same filename in your includes directory   |
| A stylesheet (`tokens.css`, `layout.css`, …)                                    | `styles/<name>.css` in your includes directory |

For pages and content the extension does not matter — your `about.njk` replaces the theme's `about.md`.

## Branding and Styles

Overriding a stylesheet replaces the theme's file entirely rather than adding to it, so start from a copy of the theme's version.

- **Colors and design tokens** — override `styles/tokens.css`. The semantic aliases at the top (e.g. `--color-brand-primary`) are the quickest way to change the look.
- **Fonts** — add font files under `<input>/assets/fonts/` and override `styles/fonts.css` with your `@font-face` declarations, then update `--font-family-base` in your `tokens.css` override.
- **Images** — a file at the same path under `<input>/assets/` replaces the theme's copy, so `assets/images/horizontal.jpg` in your project wins over the theme's.
- **Icons** — drop SVGs in `<input>/assets/icons/`; they are checked before the theme's icons and before Material Symbols. Use them in templates with `{% icon "icon-name" %}`. To look somewhere else entirely, pass `iconDirs` in the plugin options.
