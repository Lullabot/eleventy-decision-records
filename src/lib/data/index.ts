import type UserConfig from '@11ty/eleventy/UserConfig';

interface PageData {
  page: { inputPath: string };
  layout?: unknown;
}

function isPageData(data: unknown): data is PageData {
  if (typeof data !== 'object' || data === null || !('page' in data)) {
    return false;
  }
  const { page } = data;
  return (
    typeof page === 'object' &&
    page !== null &&
    'inputPath' in page &&
    typeof page.inputPath === 'string'
  );
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
    layout: (data: unknown): unknown => {
      if (!isPageData(data)) {
        throw new Error('eleventyComputed.layout: page.inputPath is missing');
      }
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
