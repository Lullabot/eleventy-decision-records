/**
 * Register all global data with Eleventy.
 */
export default function (eleventyConfig) {
  eleventyConfig.addGlobalData('layout', 'page.njk');
  eleventyConfig.addGlobalData('compiled', () => new Date());
  eleventyConfig.addGlobalData('eleventyComputed', {
    layout: (data) => {
      if (
        data.page.inputPath.includes('/adrs/') &&
        data.page.inputPath.endsWith('.md')
      ) {
        return 'adr.njk';
      }
      return data.layout;
    },
  });
}
