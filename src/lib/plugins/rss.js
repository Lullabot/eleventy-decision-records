import { rssPlugin } from '@11ty/eleventy-plugin-rss';

/**
 * Register the RSS plugin's date and URL filters, used by the theme's feed
 * templates (templates/assets/feed-*.njk).
 */
export function rss(eleventyConfig) {
  eleventyConfig.addPlugin(rssPlugin);
}
