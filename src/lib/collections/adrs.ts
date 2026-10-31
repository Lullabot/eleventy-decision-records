import type { AdrItem, CollectionApi } from '../../types.js';

/**
 * All ADRs sorted by date descending.
 */
export function makeAdrs(
  glob: string,
): (collectionApi: CollectionApi) => AdrItem[] {
  return function adrs(collectionApi: CollectionApi): AdrItem[] {
    return collectionApi
      .getFilteredByGlob(glob)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  };
}
