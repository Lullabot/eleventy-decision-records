import { adrs } from './adrs.js';
import { topics } from './topics.js';
import { contributors } from './contributors.js';

/**
 * Register all custom collections with Eleventy.
 */
export default function (eleventyConfig) {
  eleventyConfig.addCollection('adrs', adrs);
  eleventyConfig.addCollection('topics', topics);
  eleventyConfig.addCollection('contributors', contributors);
}
