import type UserConfig from '@11ty/eleventy/UserConfig';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';

/**
 * Configure the Markdown library with anchor links.
 */
export function markdown(eleventyConfig: UserConfig): void {
  const mdLib = new MarkdownIt({ html: true }).use(markdownItAnchor);
  eleventyConfig.setLibrary('md', mdLib);
}
