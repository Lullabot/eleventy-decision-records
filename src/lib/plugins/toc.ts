import type UserConfig from '@11ty/eleventy/UserConfig';
import pluginTOC, { type TocPluginOptions } from 'eleventy-plugin-toc';

/**
 * Register the table of contents plugin.
 */
export function toc(eleventyConfig: UserConfig): void {
  const options: TocPluginOptions = {
    tags: ['h2', 'h3'],
    wrapper: '',
  };
  eleventyConfig.addPlugin(pluginTOC, options);
}
