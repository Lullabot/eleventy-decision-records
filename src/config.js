import Merge from '@11ty/eleventy-utils/src/Merge.js';
import defaultConfig from './defaultConfig.json' with { type: 'json' };

const RESOLVED = Symbol.for('eleventy-decision-records.config.resolved');

/**
 * Rewrites `{decisions}` in navigation URLs to the configured decisions
 * directory, so moving the records with `dirs.decisions` also moves the
 * links pointing at them. Projects writing their own navigation can use
 * the same token or hardcode a path.
 */
function resolveNavigationTokens(config) {
  for (const group of Object.values(config.navigation ?? {})) {
    for (const item of group) {
      if (typeof item.url === 'string') {
        item.url = item.url.replace('{decisions}', config.dirs.decisions);
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
  resolveNavigationTokens(resolved);
  Object.defineProperty(resolved, RESOLVED, { value: true });
  return resolved;
}
