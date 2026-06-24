// Maps stat family IDs to their required access tier.
// TODO: populate tier map once pricing tiers are finalized.
// Currently every family returns tier 1 so no active subscriber will be locked.

const STAT_TIER_MAP: Record<string, number> = {};

/**
 * Returns the minimum subscription tier required to access a stat family.
 * Defaults to tier 1 for any family not explicitly mapped.
 */
export function getStatTier(familyId: string): number {
  return STAT_TIER_MAP[familyId] ?? 1;
}
