import pluginRss from '@11ty/eleventy-plugin-rss';

/**
 * Register the RSS feed plugin.
 */
export function rss(eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
}
