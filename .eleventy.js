import collections from './_11ty/collections/index.js';
import data from './_11ty/data/index.js';
import filters from './_11ty/filters/index.js';
import passthroughs from './_11ty/passthroughs/index.js';
import plugins from './_11ty/plugins/index.js';
import shortcodes from './_11ty/shortcodes/index.js';

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
