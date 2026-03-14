/**
 * Register all passthrough copy rules with Eleventy.
 */
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ './src/assets': '/' });
  eleventyConfig.addPassthroughCopy({
    './node_modules/@orama/orama/dist/browser': '/js/orama',
  });
}
