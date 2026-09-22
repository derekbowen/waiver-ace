// Crawl-budget control for the industry × state matrix.
//
// The full cross-join is 27 industries × 50 states = 1,350 near-identical
// pages. Google crawled a large slice of them and filed them under
// "Crawled – currently not indexed", which is its verdict on thin/templated
// pages. The fix is to index a small, genuinely useful subset (with extra
// pair-specific content) and mark the rest noindex,follow so link equity
// still flows to the industry and state hubs.

/** Verticals with real search demand for "<activity> waiver" queries. */
export const PRIORITY_INDUSTRY_SLUGS = [
  "bounce-house-rental-waiver-software",
  "boat-rental-waiver-software",
  "jet-ski-rental-waiver-software",
  "atv-rental-waiver-software",
  "kayak-rental-waiver-software",
  "party-rental-waiver-software",
  "ski-rental-waiver-software",
  "golf-cart-rental-waiver-software",
  "equipment-rental-waiver-software",
  "trampoline-park-waiver-software",
  "climbing-gym-waiver-software",
  "bike-rental-waiver-software",
] as const;

/** States with the largest rental/recreation operator bases. */
export const PRIORITY_STATE_SLUGS = [
  "florida",
  "texas",
  "california",
  "arizona",
  "colorado",
  "georgia",
  "tennessee",
  "north-carolina",
  "michigan",
  "wisconsin",
] as const;

const industrySet = new Set<string>(PRIORITY_INDUSTRY_SLUGS);
const stateSet = new Set<string>(PRIORITY_STATE_SLUGS);

/** True when the pair should be indexable and listed in the sitemap. */
export function isPriorityMatrixPair(industrySlug: string, stateSlug: string): boolean {
  return industrySet.has(industrySlug) && stateSet.has(stateSlug);
}

/** The indexable subset, used for sitemap generation and internal linking. */
export function listPriorityMatrixSlugs(): { industrySlug: string; stateSlug: string }[] {
  const pairs: { industrySlug: string; stateSlug: string }[] = [];
  for (const industrySlug of PRIORITY_INDUSTRY_SLUGS) {
    for (const stateSlug of PRIORITY_STATE_SLUGS) {
      pairs.push({ industrySlug, stateSlug });
    }
  }
  return pairs;
}
