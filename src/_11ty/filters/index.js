import { timeSince, datetimeFormat } from './dates.js';
import { byContributor, withTopic, withPracticeArea } from './collections.js';
import { render, cssmin, inspect } from './strings.js';

/**
 * Register all custom filters with Eleventy.
 */
export default function (eleventyConfig) {
  eleventyConfig.addFilter('timeSince', timeSince);
  eleventyConfig.addFilter('datetimeFormat', datetimeFormat);
  eleventyConfig.addFilter('byContributor', byContributor);
  eleventyConfig.addFilter('withTopic', withTopic);
  eleventyConfig.addFilter('withPracticeArea', withPracticeArea);
  eleventyConfig.addFilter('render', render);
  eleventyConfig.addFilter('cssmin', cssmin);
  eleventyConfig.addFilter('inspect', inspect);
}
