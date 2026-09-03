import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'node-html-parser';

const CUSTOM_ICON_DIR = join(import.meta.dirname, '../../assets/icons');

const MATERIAL_ICON_DIR = join(
  import.meta.dirname,
  '../../..',
  'node_modules',
  '@material-symbols',
  'svg-400',
  'rounded',
);

/**
 * Resolves an icon name to a file path, checking the custom icons
 * directory first and falling back to Material Symbols.
 */
function resolveIcon(name) {
  const customPath = join(CUSTOM_ICON_DIR, `${name}.svg`);
  if (existsSync(customPath)) {
    return customPath;
  }
  return join(MATERIAL_ICON_DIR, `${name}.svg`);
}

/**
 * Returns a standalone SVG suitable for use as a favicon.
 * Embeds a <style> block so the icon adapts to light/dark mode.
 *
 * Usage: {% favicon "brand_family-fill" %}
 */
export function favicon(name) {
  const file = resolveIcon(name);
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

/**
 * Inlines an SVG icon. Checks src/assets/icons/ for custom SVGs first,
 * then falls back to Material Symbols.
 *
 * Usage: {% icon "home-fill" %}
 *        {% icon "github", "GitHub" %}
 */
export function icon(name, label) {
  const file = resolveIcon(name);
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
