import { timeSince, datetimeFormat, year, isoDate } from './dates.js';
import {
  byContributor,
  withTopic,
  withPracticeArea,
  setKey,
  topTopics,
} from './collections.js';
import { spaceless } from './strings.js';

/**
 * Register all custom filters with Eleventy.
 */
export default function (eleventyConfig) {
  eleventyConfig.addFilter('timeSince', timeSince);
  eleventyConfig.addFilter('datetimeFormat', datetimeFormat);
  eleventyConfig.addFilter('year', year);
  eleventyConfig.addFilter('isoDate', isoDate);
  eleventyConfig.addFilter('byContributor', byContributor);
  eleventyConfig.addFilter('withTopic', withTopic);
  eleventyConfig.addFilter('withPracticeArea', withPracticeArea);
  eleventyConfig.addFilter('setKey', setKey);
  eleventyConfig.addFilter('topTopics', topTopics);
  eleventyConfig.addFilter('spaceless', spaceless);
}
