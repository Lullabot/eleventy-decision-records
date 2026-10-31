import type UserConfig from '@11ty/eleventy/UserConfig';
import { feedPlugin, type FeedPluginOptions } from '@11ty/eleventy-plugin-rss';
import type { SiteConfig } from '../../types.js';

/**
 * Register the Atom feed plugin, served at /feed.xml.
 */
export function rss(eleventyConfig: UserConfig, site: SiteConfig): void {
  const options: FeedPluginOptions = {
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
  };
  eleventyConfig.addPlugin(feedPlugin, options);
}
