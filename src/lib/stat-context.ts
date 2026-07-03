// Pure helpers that resolve the stat detail page's "context" — active
// instrument / timeframe — from the stat catalog + the requested path
// segment. No React, no server-only imports.
//
// resolveActiveInstrument / resolveActiveTimeframe are called from the
// Server Component (page.tsx) to resolve the instrument path segment and
// pick a default timeframe. The client wrapper (StatDetailClient) receives
// the resolved instrument/timeframe as props instead of re-deriving them —
// it uses the remaining helpers here (getFamilyTimeframes,
// getGlobalInstruments, isIsoDate) to render its controls.

import type { StatFamilyMeta } from "@/types/stats";
import type { PeriodPreset } from "@/lib/period";

export const PERIOD_PRESETS: PeriodPreset[] = [
  "all",
  "1m",
  "3m",
  "6m",
  "ytd",
  "1yr",
  "2yr",
  "3yr",
  "5yr",
  "10yr",
];

export function isPeriodPreset(value: string | null): value is PeriodPreset {
  return value !== null && (PERIOD_PRESETS as string[]).includes(value);
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string | null | undefined): value is string {
  return typeof value === "string" && ISO_DATE_RE.test(value);
}

/** All instrument codes for a given stat family, sorted. Empty when the family is unknown. */
export function getFamilyInstruments(
  catalog: StatFamilyMeta[],
  statId: string,
): string[] {
  const family = catalog.find((f) => f.family === statId);
  if (!family) return [];
  return Array.from(new Set(family.timeframes.map((t) => t.instrument))).sort();
}

/** All instrument codes across the whole catalog, sorted — used by the Instrument Select. */
export function getGlobalInstruments(catalog: StatFamilyMeta[]): string[] {
  const set = new Set<string>();
  for (const family of catalog) {
    for (const tf of family.timeframes) {
      set.add(tf.instrument);
    }
  }
  return Array.from(set).sort();
}

/**
 * Timeframe codes available for a given family + instrument, in the API's
 * semantic order (smallest to largest). We deliberately do NOT sort: a
 * lexicographic sort would break the order (e.g. "1h" < "30min").
 */
export function getFamilyTimeframes(
  catalog: StatFamilyMeta[],
  statId: string,
  instrument: string,
): string[] {
  const family = catalog.find((f) => f.family === statId);
  if (!family) return [];
  return Array.from(
    new Set(
      family.timeframes
        .filter((t) => t.instrument === instrument)
        .map((t) => t.timeframe),
    ),
  );
}

/**
 * Resolves the active instrument: the requested code when it is a known
 * instrument for this family, otherwise the first available instrument for
 * the family (falling back further to the raw request, then to "").
 */
export function resolveActiveInstrument(
  catalog: StatFamilyMeta[],
  statId: string,
  requested: string | null,
): string {
  const familyInstruments = getFamilyInstruments(catalog, statId);
  const normalized = requested?.trim().toUpperCase() || "";

  if (normalized && familyInstruments.includes(normalized)) {
    return normalized;
  }
  if (familyInstruments.length > 0) {
    return familyInstruments[0];
  }
  // Family unknown to the catalog (e.g. catalog fetch failed) — fall back to
  // whatever was requested, or the global instrument list, so the page can
  // still attempt the data fetch and surface its own "no data" / error state.
  if (normalized) return normalized;
  const global = getGlobalInstruments(catalog);
  return global[0] ?? "";
}

/**
 * Resolves the active timeframe for a family + instrument: the requested
 * timeframe when available, otherwise "daily" if present, otherwise the
 * first available timeframe.
 */
export function resolveActiveTimeframe(
  catalog: StatFamilyMeta[],
  statId: string,
  instrument: string,
  requested: string | null,
): string {
  const available = getFamilyTimeframes(catalog, statId, instrument);
  if (requested && available.includes(requested)) return requested;
  if (available.includes("daily")) return "daily";
  return available[0] ?? requested ?? "daily";
}
