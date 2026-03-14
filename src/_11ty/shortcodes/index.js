import { favicon, icon } from './icons.js';
import { oramaIndex } from './search.js';

/**
 * Register all custom shortcodes with Eleventy.
 */
export default function (eleventyConfig) {
  eleventyConfig.addShortcode('favicon', favicon);
  eleventyConfig.addShortcode('icon', icon);
  eleventyConfig.addShortcode('oramaIndex', oramaIndex);
}
