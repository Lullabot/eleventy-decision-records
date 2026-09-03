import pluginSyntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';

/**
 * Register the syntax highlighting plugin.
 */
export function syntaxHighlight(eleventyConfig) {
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
}
