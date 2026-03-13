import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'node-html-parser';

/**
 * Inlines a Material Symbols SVG.
 *
 * Usage: {% icon "home-fill" %}
 *        {% icon "search", "Search the site" %}
 */
/**
 * Returns a standalone SVG suitable for use as a favicon.
 * Embeds a <style> block so the icon adapts to light/dark mode.
 *
 * Usage: {% favicon "brand_family-fill" %}
 */
export function favicon(name) {
  const file = join(ICON_DIR, `${name}.svg`);
  const root = parse(readFileSync(file, 'utf8'));
  const svg = root.querySelector('svg');

  svg.removeAttribute('width');
  svg.removeAttribute('height');

  const style = parse(`
    <style>
      svg {
        background-color: #fff;
      }

      path {
        fill: #01070b;
      }

      @media(prefers-color-scheme:dark) {
        svg {
          background-color: #01070b;
        }
        path {
          fill: #fff;
        }
      }
    </style>
  `);
  svg.insertAdjacentHTML('afterbegin', style.toString());

  return root.toString();
}

export function icon(name, label) {
  const file = join(ICON_DIR, `${name}.svg`);
  const root = parse(readFileSync(file, 'utf8'));
  const svg = root.querySelector('svg');

  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('fill', 'currentColor');

  for (const el of svg.querySelectorAll('[fill]')) {
    el.setAttribute('fill', 'currentColor');
  }

  if (label) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', label);
  } else {
    svg.setAttribute('aria-hidden', 'true');
  }

  return root.toString();
}

const ICON_DIR = join(
  import.meta.dirname,
  '../..',
  'node_modules',
  '@material-symbols',
  'svg-400',
  'rounded',
);
