import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { parse, type HTMLElement } from 'node-html-parser';

/**
 * Resolves an icon name to a file path by checking each directory in
 * order. The plugin assembles the list as: project icon overrides,
 * then the theme's custom icons, then Material Symbols.
 */
function resolveIcon(iconDirs: string[], name: string): string {
  for (const dir of iconDirs) {
    const path = join(dir, `${name}.svg`);
    if (existsSync(path)) {
      return path;
    }
  }
  throw new Error(`Icon "${name}" not found in: ${iconDirs.join(', ')}`);
}

/**
 * Parses an icon file and returns the document root along with its
 * <svg> element.
 */
function loadIcon(file: string): { root: HTMLElement; svg: HTMLElement } {
  const root = parse(readFileSync(file, 'utf8'));
  const svg = root.querySelector('svg');
  if (svg === null) {
    throw new Error(`Icon file "${file}" has no <svg> element`);
  }
  return { root, svg };
}

/**
 * Returns a standalone SVG suitable for use as a favicon.
 * Embeds a <style> block so the icon adapts to light/dark mode.
 *
 * Usage: {% favicon "brand_family-fill" %}
 */
export function makeFavicon(iconDirs: string[]): (name: string) => string {
  return function favicon(name: string): string {
    const { root, svg } = loadIcon(resolveIcon(iconDirs, name));

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
  };
}

/**
 * Inlines an SVG icon. Checks the project's icon directory first, then
 * the theme's custom SVGs, then falls back to Material Symbols.
 *
 * Usage: {% icon "home-fill" %}
 *        {% icon "github", "GitHub" %}
 */
export function makeIcon(
  iconDirs: string[],
): (name: string, label?: string) => string {
  return function icon(name: string, label?: string): string {
    const { root, svg } = loadIcon(resolveIcon(iconDirs, name));

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
  };
}
