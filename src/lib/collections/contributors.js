/**
 * Unique set of all contributors across ADRs.
 */
export function makeContributors(glob) {
  return function contributors(collectionApi) {
    const adrs = collectionApi.getFilteredByGlob(glob);
    const contributors = new Set();
    for (const adr of adrs) {
      for (const contributor of adr.data.contributors || []) {
        contributors.add(contributor);
      }
    }
    return [...contributors].sort();
  };
}
