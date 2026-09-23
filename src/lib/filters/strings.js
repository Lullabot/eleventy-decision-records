import { parse } from 'node-html-parser';

/**
 * Strips whitespace at the start/end and between HTML tags.
 */
export function spaceless(html) {
  return html.replace(/^\s+/, '').replace(/>\s+</g, '><').replace(/\s+$/, '');
}

/**
 * Wraps each table in a box that can scroll sideways, so a wide table is
 * not cut off by the content column. js/scrollable.js makes the box
 * keyboard-reachable only while it actually overflows.
 *
 * {{ content | scrollable | safe }}
 */
export function scrollable(html) {
  const root = parse(html);
  for (const table of root.querySelectorAll('table')) {
    table.replaceWith(`<div class="table-scroll">${table.toString()}</div>`);
  }
  return root.toString();
}
