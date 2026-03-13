import { transform } from 'lightningcss';
import pluginBundle from '@11ty/eleventy-plugin-bundle';

/**
 * Register the bundle plugin with lightningcss minification.
 */
export function bundle(eleventyConfig) {
  eleventyConfig.addPlugin(pluginBundle, {
    transforms: [
      function (content) {
        if (this.type === 'css') {
          const { code } = transform({
            filename: 'bundle.css',
            code: Buffer.from(content),
            minify: true,
          });
          return code.toString();
        }
        return content;
      },
    ],
  });
}
