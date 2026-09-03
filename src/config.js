import Merge from '@11ty/eleventy-utils/src/Merge.js';
import defaultConfig from './defaultConfig.json' with { type: 'json' };

const RESOLVED = Symbol.for('eleventy-decision-records.config.resolved');

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
  Object.defineProperty(resolved, RESOLVED, { value: true });
  return resolved;
}
