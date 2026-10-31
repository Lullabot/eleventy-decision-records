import type UserConfig from '@11ty/eleventy/UserConfig';
import { transform } from 'lightningcss';
import pluginBundle, {
  type BundlePluginOptions,
  type BundleTransformContext,
} from '@11ty/eleventy-plugin-bundle';

/**
 * Register the bundle plugin with lightningcss minification.
 */
export function bundle(eleventyConfig: UserConfig): void {
  const options: BundlePluginOptions = {
    transforms: [
      function (this: BundleTransformContext, content: string): string {
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
  };
  eleventyConfig.addPlugin(pluginBundle, options);
}
