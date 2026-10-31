import type UserConfig from '@11ty/eleventy/UserConfig';

/**
 * The slice of a template's data the layout computation reads. Eleventy
 * also calls computed functions once with a discovery proxy, so nothing
 * here may be assumed present: the proxy answers property reads but not
 * `in` checks.
 */
interface PageData {
  page?: { inputPath?: unknown };
  layout?: unknown;
}

/**
 * Register all global data with Eleventy. Markdown files inside the
 * decisions directory get the ADR layout; everything else gets the
 * plain page layout.
 */
export default function (
  eleventyConfig: UserConfig,
  decisionsDir: string,
): void {
  eleventyConfig.addGlobalData('layout', 'page.njk');
  eleventyConfig.addGlobalData('eleventyComputed', {
    layout: (data: PageData): unknown => {
      const inputPath = data.page?.inputPath;
      if (
        typeof inputPath === 'string' &&
        inputPath.includes(`/${decisionsDir}/`) &&
        inputPath.endsWith('.md')
      ) {
        return 'adr.njk';
      }
      return data.layout;
    },
  });
}
