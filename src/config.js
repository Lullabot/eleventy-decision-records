import { Merge } from '@11ty/eleventy-utils';
import defaultConfig from './defaultConfig.json' with { type: 'json' };

const RESOLVED = Symbol.for('eleventy-decision-records.config.resolved');

const FEED_TYPES = ['atom', 'rss'];

/**
 * Rewrites `{decisions}` and `{feed}` in navigation and social link URLs to
 * the configured decisions directory and feed path, so changing
 * `dirs.decisions` or `feed.path` also moves the links pointing at them.
 * Projects writing their own links can use the same tokens or hardcode a
 * path.
 */
function resolveNavigationTokens(config) {
  const groups = [
    ...Object.values(config.navigation ?? {}),
    config.site?.social ?? [],
  ];
  for (const group of groups) {
    for (const item of group) {
      if (typeof item.url === 'string') {
        item.url = item.url
          .replace('{decisions}', config.dirs.decisions)
          .replace('{feed}', config.feed.path);
      }
    }
  }
}

/**
 * Merges a partial project config over the theme defaults. Merge semantics
 * come from @11ty/eleventy-utils: objects merge deep, arrays concatenate,
 * and an `override:` key prefix replaces instead of merging.
 *
 * Safe to call on an already-resolved config (returns it unchanged), so the
 * plugin can accept either raw options or the result of this function.
 */
export default function themeConfig(config = {}) {
  if (config[RESOLVED]) {
    return config;
  }
  const resolved = Merge(structuredClone(defaultConfig), config);
  if (!FEED_TYPES.includes(resolved.feed.type)) {
    throw new Error(
      `feed.type must be one of ${FEED_TYPES.join(', ')}, got "${resolved.feed.type}"`,
    );
  }
  resolveNavigationTokens(resolved);
  Object.defineProperty(resolved, RESOLVED, { value: true });
  return resolved;
}
