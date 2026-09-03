/**
 * Strips whitespace at the start/end and between HTML tags.
 */
export function spaceless(html) {
  return html.replace(/^\s+/, '').replace(/>\s+</g, '><').replace(/\s+$/, '');
}
