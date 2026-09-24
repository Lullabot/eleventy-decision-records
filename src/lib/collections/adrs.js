/**
 * All ADRs sorted by date descending.
 */
export function makeAdrs(glob) {
  return function adrs(collectionApi) {
    return collectionApi
      .getFilteredByGlob(glob)
      .sort((a, b) => b.date - a.date);
  };
}
