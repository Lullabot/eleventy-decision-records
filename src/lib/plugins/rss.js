import { feedPlugin } from '@11ty/eleventy-plugin-rss';
import site from '../../_data/site.json' with { type: 'json' };

/**
 * Register the Atom feed plugin, served at /feed.xml.
 */
export function rss(eleventyConfig) {
  eleventyConfig.addPlugin(feedPlugin, {
    type: 'atom',
    outputPath: '/feed.xml',
    collection: {
      name: 'adrs',
      limit: 0,
    },
    metadata: {
      language: 'en',
      title: `${site.title} — ${site.organization}`,
      subtitle: site.description,
      base: site.url,
      author: {
        name: site.organization,
      },
    },
  });
}
