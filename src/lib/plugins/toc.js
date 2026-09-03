import pluginTOC from 'eleventy-plugin-toc';

/**
 * Register the table of contents plugin.
 */
export function toc(eleventyConfig) {
  eleventyConfig.addPlugin(pluginTOC, {
    tags: ['h2', 'h3'],
    wrapper: '',
  });
}
