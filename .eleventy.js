import collections from './src/_11ty/collections/index.js';
import data from './src/_11ty/data/index.js';
import filters from './src/_11ty/filters/index.js';
import passthroughs from './src/_11ty/passthroughs/index.js';
import plugins from './src/_11ty/plugins/index.js';
import shortcodes from './src/_11ty/shortcodes/index.js';

export default function (eleventyConfig) {
  collections(eleventyConfig);
  data(eleventyConfig);
  filters(eleventyConfig);
  passthroughs(eleventyConfig);
  plugins(eleventyConfig);
  shortcodes(eleventyConfig);

  // Disable morphdom-based DOM diffing so that the dev server performs full
  // page navigations, which is required for cross-document view transitions
  // (@view-transition { navigation: auto }) to fire.
  eleventyConfig.setServerOptions({
    domDiff: false,
  });

  return {
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
}
