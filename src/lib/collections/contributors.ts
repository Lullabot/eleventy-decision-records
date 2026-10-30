import type { CollectionApi } from '../../types.js';

/**
 * Unique set of all contributors across ADRs.
 */
export function makeContributors(
  glob: string,
): (collectionApi: CollectionApi) => string[] {
  return function contributors(collectionApi: CollectionApi): string[] {
    const adrs = collectionApi.getFilteredByGlob(glob);
    const contributors = new Set<string>();
    for (const adr of adrs) {
      for (const contributor of adr.data.contributors || []) {
        contributors.add(contributor);
      }
    }
    return [...contributors].sort();
  };
}
