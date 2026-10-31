import { Merge } from '@11ty/eleventy-utils';
import defaultConfig from './defaultConfig.json' with { type: 'json' };
import type { DecisionRecordsOptions, ResolvedConfig } from './types.js';

const RESOLVED: unique symbol = Symbol.for(
  'eleventy-decision-records.config.resolved',
);

function isResolved(
  config: DecisionRecordsOptions | ResolvedConfig,
): config is ResolvedConfig {
  return RESOLVED in config && config[RESOLVED] === true;
}

/**
 * Rewrites `{decisions}` in navigation URLs to the configured decisions
 * directory, so moving the records with `dirs.decisions` also moves the
 * links pointing at them. Projects writing their own navigation can use
 * the same token or hardcode a path.
 */
function resolveNavigationTokens(config: ResolvedConfig): void {
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
export default function themeConfig(
  config: DecisionRecordsOptions | ResolvedConfig = {},
): ResolvedConfig {
  if (isResolved(config)) {
    return config;
  }
  const resolved = Merge(
    structuredClone(defaultConfig),
    config,
  ) as ResolvedConfig;
  resolveNavigationTokens(resolved);
  Object.defineProperty(resolved, RESOLVED, { value: true });
  return resolved;
}
