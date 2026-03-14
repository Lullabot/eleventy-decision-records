import MarkdownIt from 'markdown-it';
import { transform } from 'lightningcss';
import { inspect as nodeInspect } from 'node:util';

const md = new MarkdownIt({ html: true });

/**
 * Renders an inline markdown string to HTML.
 *
 * @example
 * {{ "A **bold** choice" | render }}
 * → "A <strong>bold</strong> choice"
 */
export function render(str) {
  return str ? md.renderInline(str) : '';
}

/**
 * Minifies a block of CSS using lightningcss.
 *
 * @example
 * {% filter cssmin %}.foo { color: red; }{% endfilter %}
 * → ".foo{color:red}"
 */
export function cssmin(css) {
  const { code } = transform({
    filename: 'style.css',
    code: Buffer.from(css),
    minify: true,
  });
  return code.toString();
}

/**
 * Debug filter — dumps a value via Node's util.inspect.
 *
 * @example
 * {{ collections.adrs | inspect }}
 * → "[{ data: { title: '...', ... }, ... }]"
 */
export function inspect(value) {
  return nodeInspect(value, { depth: 4 });
}

/**
 * Strips whitespace at the start/end and between HTML tags.
 */
export function spaceless(html) {
  return html.replace(/^\s+/, '').replace(/>\s+</g, '><').replace(/\s+$/, '');
}
