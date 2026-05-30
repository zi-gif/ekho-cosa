import { EKHO_COMPETITOR_FOOTPRINT } from "@/data/ekho-competitor-footprint";
import type { DealerSnapshot, EkhoCompetitor } from "@/lib/types";

/**
 * Pick the most relevant Ekho-active competitor for a target dealer.
 * Priority: same state > same region > same segment > anything in segment.
 */
export function matchNearestCompetitor(target: DealerSnapshot): EkhoCompetitor {
  const sameSegment = EKHO_COMPETITOR_FOOTPRINT.filter((c) =>
    target.segments.includes(c.segment)
  );
  const pool = sameSegment.length > 0 ? sameSegment : EKHO_COMPETITOR_FOOTPRINT;

  const sameState = pool.find((c) => c.state === target.state);
  if (sameState) return sameState;

  const sameRegion = pool.find((c) => c.region === target.region);
  if (sameRegion) return sameRegion;

  return pool[0];
}
