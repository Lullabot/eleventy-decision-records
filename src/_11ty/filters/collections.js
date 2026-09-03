/**
 * Filters a collection of ADRs to those with a given contributor.
 *
 * @example
 * {{ collections.adrs | byContributor("Jane Doe") }}
 * → [adr1, adr3]
 */
export function byContributor(collection, contributor) {
  return collection.filter((item) =>
    (item.data.contributors || []).includes(contributor),
  );
}

/**
 * Filters a collection of ADRs to those with a given topic.
 *
 * @example
 * {{ collections.adrs | withTopic("accessibility") }}
 * → [adr2, adr5]
 */
export function withTopic(collection, topic) {
  const needle = topic.toLowerCase();
  return collection.filter((item) =>
    (item.data.topics || []).some((t) => t.toLowerCase() === needle),
  );
}

/**
 * Filters a collection of ADRs to those with a given practice area.
 *
 * @example
 * {{ collections.adrs | withPracticeArea("Engineering") }}
 * → [adr1, adr4]
 */
export function withPracticeArea(collection, practiceArea) {
  return collection.filter((item) => item.data.practiceArea === practiceArea);
}

/**
 * Returns a new object with the given key set to the given value.
 * Useful for accumulating counts in Nunjucks loops.
 *
 * @example
 * {% set counts = counts | setKey("css", 3) %}
 */
export function setKey(obj, key, value) {
  return { ...obj, [key]: value };
}

/**
 * Returns the top N topic labels from a { topic: count } map,
 * sorted by count descending.
 *
 * @example
 * {{ topicCounts | topTopics(3) }}
 * → ["css", "accessibility", "react"]
 */
export function topTopics(counts, n) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label]) => label);
}
