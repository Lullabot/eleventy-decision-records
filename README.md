# @lullabot/eleventy-decision-records

An [Eleventy](https://www.11ty.dev/) (v3) theme plugin for documenting architectural decision records (ADRs).

Install it into an Eleventy project and you get the listing pages, per-topic and per-contributor pages, search, and an Atom feed — without copying any of it into your repository.

## Getting Started

```bash
npm install @lullabot/eleventy-decision-records
```

Eleventy v3 is a peer dependency, so install it too if you have not already:

```bash
npm install --save-dev @11ty/eleventy
```

Register the plugin in your Eleventy config:

```js
import decisionRecords from '@lullabot/eleventy-decision-records';

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(decisionRecords, {
    site: {
      organization: 'Your Organization',
      url: 'https://decisions.example.com/',
    },
  });

  return {
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'docs',
    },
  };
}
```

Both template engines must be set to `njk` — the theme's pages and layouts are Nunjucks, including the markdown ones. Your project also needs `"type": "module"` in its `package.json`.

Site metadata, navigation, and practice areas are configured through the plugin options only. The theme registers them as global data, which Eleventy merges _over_ any `_data/site.json`, `_data/navigation.json`, or `_data/practiceAreas.json` in your project.

Then write decision records as markdown files in `docs/decisions/`, and build as usual:

```bash
npx eleventy --serve
```

The theme supplies a homepage and an about page until you add your own. Anything it provides can be replaced by putting a file of the same name in your project — see [Customizing](docs/customizing.md).

## Documentation

- [Customizing for your organization](docs/customizing.md) — plugin options, overriding templates, styles, and icons
- [Writing ADRs](docs/writing-adrs.md) — naming convention and frontmatter fields
- [Development](docs/development.md) — commands, testing, CI/deployment
- [Architecture](docs/architecture.md) — how the plugin is put together

## License

See [LICENSE](LICENSE) for details.
