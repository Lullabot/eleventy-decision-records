/**
 * Unique set of all contributors across ADRs.
 */
export function contributors(collectionApi) {
  const adrs = collectionApi.getFilteredByGlob('src/adrs/*.md');
  const contributors = new Set();
  for (const adr of adrs) {
    for (const contributor of adr.data.contributors || []) {
      contributors.add(contributor);
    }
  }
  return [...contributors].sort();
}
