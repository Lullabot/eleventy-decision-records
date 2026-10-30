declare module '@11ty/eleventy-plugin-bundle' {
  import type UserConfig from '@11ty/eleventy/UserConfig';

  export interface BundleTransformContext {
    type: string;
  }

  export interface BundlePluginOptions {
    transforms: Array<
      (this: BundleTransformContext, content: string) => string
    >;
  }

  export default function pluginBundle(
    eleventyConfig: UserConfig,
    options?: BundlePluginOptions,
  ): void;
}

declare module '@11ty/eleventy-plugin-rss' {
  import type UserConfig from '@11ty/eleventy/UserConfig';

  export interface FeedPluginOptions {
    type: 'atom' | 'rss' | 'json';
    outputPath: string;
    collection: {
      name: string;
      limit: number;
    };
    metadata: {
      language: string;
      title: string;
      subtitle: string;
      base: string;
      author: {
        name: string;
      };
    };
  }

  export function feedPlugin(
    eleventyConfig: UserConfig,
    options: FeedPluginOptions,
  ): void;
}

declare module '@11ty/eleventy-plugin-syntaxhighlight' {
  import type UserConfig from '@11ty/eleventy/UserConfig';

  export default function pluginSyntaxHighlight(
    eleventyConfig: UserConfig,
  ): void;
}

declare module 'eleventy-plugin-toc' {
  import type UserConfig from '@11ty/eleventy/UserConfig';

  export interface TocPluginOptions {
    tags: string[];
    wrapper: string;
  }

  export default function pluginTOC(
    eleventyConfig: UserConfig,
    options?: TocPluginOptions,
  ): void;
}

declare module '@11ty/eleventy-utils' {
  export function Merge<T>(target: T, ...sources: unknown[]): T;
}
