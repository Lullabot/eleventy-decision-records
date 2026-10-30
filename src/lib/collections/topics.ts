import type { CollectionApi, TopicCount } from '../../types.js';

/**
 * Topics with counts, sorted by count descending.
 */
export function makeTopics(
  glob: string,
): (collectionApi: CollectionApi) => TopicCount[] {
  return function topics(collectionApi: CollectionApi): TopicCount[] {
    const adrs = collectionApi.getFilteredByGlob(glob);
    const counts = new Map<string, number>();
    for (const adr of adrs) {
      for (const topic of adr.data.topics || []) {
        const key = topic.toLowerCase();
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  };
}
