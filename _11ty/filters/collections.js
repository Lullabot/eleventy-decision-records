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
