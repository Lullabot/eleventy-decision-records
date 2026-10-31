import type { CollectionApi, PracticeArea } from '../../types.js';

/**
 * Configured practice areas that have at least one ADR, in config order.
 */
export function makePracticeAreas(
  glob: string,
  practiceAreas: PracticeArea[],
): (collectionApi: CollectionApi) => PracticeArea[] {
  return function practiceAreasWithAdrs(
    collectionApi: CollectionApi,
  ): PracticeArea[] {
    const used = new Set(
      collectionApi.getFilteredByGlob(glob).map((adr) => adr.data.practiceArea),
    );
    return practiceAreas.filter((area) => used.has(area.name));
  };
}
