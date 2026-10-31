import type UserConfig from '@11ty/eleventy/UserConfig';
import type { ResolvedConfig } from '../../types.js';
import { bundle } from './bundle.js';
import { markdown } from './markdown.js';
import { toc } from './toc.js';
import { rss } from './rss.js';
import { syntaxHighlight } from './syntax-highlight.js';

/**
 * Register all plugins with Eleventy.
 */
export default function (
  eleventyConfig: UserConfig,
  opts: ResolvedConfig,
): void {
  bundle(eleventyConfig);
  markdown(eleventyConfig);
  toc(eleventyConfig);
  rss(eleventyConfig, opts.site);
  syntaxHighlight(eleventyConfig);
}
