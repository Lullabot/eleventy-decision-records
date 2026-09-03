import decisionRecords from '@lullabot/eleventy-decision-records';

// Deliberately minimal: the fixture site exercises the theme's shipped
// defaults, so anything configured here is something the tests are
// specifically covering rather than incidental setup.
export default function (eleventyConfig) {
  eleventyConfig.addPlugin(decisionRecords, {
    dirs: {
      decisions: 'adrs',
    },
  });

  return {
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: '_site',
    },
  };
}
