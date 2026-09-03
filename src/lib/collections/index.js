import { makeAdrs } from './adrs.js';
import { makeTopics } from './topics.js';
import { makeContributors } from './contributors.js';

/**
 * Register all custom collections with Eleventy. All three derive from the
 * same glob, so `dirs.decisions` is the single place a project changes to
 * move its records.
 */
export default function (eleventyConfig, glob) {
  eleventyConfig.addCollection('adrs', makeAdrs(glob));
  eleventyConfig.addCollection('topics', makeTopics(glob));
  eleventyConfig.addCollection('contributors', makeContributors(glob));
}
