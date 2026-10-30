import type UserConfig from '@11ty/eleventy/UserConfig';
import pluginSyntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';

/**
 * Register the syntax highlighting plugin.
 */
export function syntaxHighlight(eleventyConfig: UserConfig): void {
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
}
