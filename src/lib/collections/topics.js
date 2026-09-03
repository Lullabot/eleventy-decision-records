/**
 * Topics with counts, sorted by count descending.
 */
export function topics(collectionApi) {
  const adrs = collectionApi.getFilteredByGlob('src/adrs/*.md');
  const counts = new Map();
  for (const adr of adrs) {
    for (const topic of adr.data.topics || []) {
      const key = topic.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}
