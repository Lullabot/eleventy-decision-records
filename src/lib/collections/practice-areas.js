/**
 * Configured practice areas that have at least one ADR, in config order.
 */
export function makePracticeAreas(glob, practiceAreas) {
  return function practiceAreasWithAdrs(collectionApi) {
    const used = new Set(
      collectionApi.getFilteredByGlob(glob).map((adr) => adr.data.practiceArea),
    );
    return practiceAreas.filter((area) => used.has(area.name));
  };
}
