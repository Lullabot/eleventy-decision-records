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

  return {
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
}
