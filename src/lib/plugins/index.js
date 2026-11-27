import { bundle } from './bundle.js';
import { markdown } from './markdown.js';
import { toc } from './toc.js';
import { rss } from './rss.js';
import { syntaxHighlight } from './syntax-highlight.js';

/**
 * Register all plugins with Eleventy.
 */
export default function (eleventyConfig) {
  bundle(eleventyConfig);
  markdown(eleventyConfig);
  toc(eleventyConfig);
  rss(eleventyConfig);
  syntaxHighlight(eleventyConfig);
}
