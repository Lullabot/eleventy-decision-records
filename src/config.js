import { Merge } from '@11ty/eleventy-utils';
import defaultConfig from './defaultConfig.json' with { type: 'json' };

const RESOLVED = Symbol.for('eleventy-decision-records.config.resolved');

const FEED_TYPES = ['atom', 'rss'];

/**
 * Rewrites `{decisions}` and `{feed}` in navigation and social link URLs to
 * the configured decisions directory and the first feed's path, so changing
 * `dirs.decisions` or `feeds` also moves the links pointing at them. Links
 * to `{feed}` are dropped when there are no feeds. Projects writing their
 * own links can use the same tokens or hardcode a path.
 */
function resolveNavigationTokens(config) {
  const feedPath = config.feeds[0]?.path;
  const resolve = (items) =>
    items
      .filter((item) => feedPath || !String(item.url).includes('{feed}'))
      .map((item) =>
        typeof item.url === 'string'
          ? {
              ...item,
              url: item.url
                .replace('{decisions}', config.dirs.decisions)
                .replace('{feed}', feedPath),
            }
          : item,
      );
  for (const [name, items] of Object.entries(config.navigation ?? {})) {
    config.navigation[name] = resolve(items);
  }
  if (config.site?.social) {
    config.site.social = resolve(config.site.social);
  }
}

/**
 * Each feed needs a path, and each type can be listed once: its template is
 * registered as `feed-<type>.njk`, which is also the name a project
 * overrides it with.
 */
function validateFeeds(feeds) {
  const seen = new Set();
  for (const { type, path } of feeds) {
    if (typeof path !== 'string' || !path.startsWith('/')) {
      throw new Error(
        `feeds[].path must be a path starting with "/", got ${JSON.stringify(path)}`,
      );
    }
    if (!FEED_TYPES.includes(type)) {
      throw new Error(
        `feeds[].type must be one of ${FEED_TYPES.join(', ')}, got "${type}"`,
      );
    }
    if (seen.has(type)) {
      throw new Error(`feeds lists the "${type}" type more than once`);
    }
    seen.add(type);
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
  validateFeeds(resolved.feeds);
  resolveNavigationTokens(resolved);
  Object.defineProperty(resolved, RESOLVED, { value: true });
  return resolved;
}
