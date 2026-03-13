/**
 * Register all passthrough copy rules with Eleventy.
 */
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ './src/assets': '/' });
}
