/**
 * Register all global data with Eleventy. Markdown files inside the
 * decisions directory get the ADR layout; everything else gets the
 * plain page layout.
 */
export default function (eleventyConfig, decisionsDir) {
  eleventyConfig.addGlobalData('layout', 'page.njk');
  eleventyConfig.addGlobalData('eleventyComputed', {
    layout: (data) => {
      if (
        data.page.inputPath.includes(`/${decisionsDir}/`) &&
        data.page.inputPath.endsWith('.md')
      ) {
        return 'adr.njk';
      }
      return data.layout;
    },
  });
}
