/**
 * All ADRs sorted by date descending.
 */
export function adrs(collectionApi) {
  return collectionApi
    .getFilteredByGlob('src/adrs/*.md')
    .sort((a, b) => b.date - a.date);
}
