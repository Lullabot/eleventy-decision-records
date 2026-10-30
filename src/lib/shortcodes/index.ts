import type UserConfig from '@11ty/eleventy/UserConfig';
import type { ResolvedConfig } from '../../types.js';
import { makeFavicon, makeIcon } from './icons.js';
import { oramaIndex } from './search.js';

/**
 * Register all custom shortcodes with Eleventy.
 */
export default function (
  eleventyConfig: UserConfig,
  opts: ResolvedConfig,
): void {
  eleventyConfig.addShortcode('favicon', makeFavicon(opts.iconDirs));
  eleventyConfig.addShortcode('icon', makeIcon(opts.iconDirs));
  eleventyConfig.addShortcode('oramaIndex', oramaIndex);
}
