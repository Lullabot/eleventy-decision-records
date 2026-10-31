import type UserConfig from '@11ty/eleventy/UserConfig';
import decisionRecords from '@lullabot/eleventy-decision-records';

interface FixtureConfig {
  markdownTemplateEngine: string;
  htmlTemplateEngine: string;
  dir: { input: string; output: string };
}

// Deliberately minimal: the fixture site exercises the theme's shipped
// defaults, so anything configured here is something the tests are
// specifically covering rather than incidental setup.
export default function (eleventyConfig: UserConfig): FixtureConfig {
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
