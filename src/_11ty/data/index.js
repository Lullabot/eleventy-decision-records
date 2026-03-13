/**
 * Register all global data with Eleventy.
 */
export default function (eleventyConfig) {
  eleventyConfig.addGlobalData('layout', 'page.njk');
  eleventyConfig.addGlobalData('compiled', () => new Date());
}
