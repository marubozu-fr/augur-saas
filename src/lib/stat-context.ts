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
 * Ranks instrument codes by the number of stat families that cover them,
 * descending, ties broken alphabetically. The single source of truth for
 * "which instrument matters most" — pickPrimaryInstrument just takes the
 * first entry, getCatalogCoverage exposes the full ranked list so the
 * landing page lists instruments in the same order everywhere (hero
 * subtitle, checklist, meta description).
 */
function rankInstrumentsByFamilyCoverage(catalog: StatFamilyMeta[]): string[] {
  const familyCounts = new Map<string, number>();
  for (const family of catalog) {
    const instruments = new Set(family.timeframes.map((tf) => tf.instrument));
    for (const instrument of instruments) {
      familyCounts.set(instrument, (familyCounts.get(instrument) ?? 0) + 1);
    }
  }
  return Array.from(familyCounts.keys()).sort((a, b) => {
    const countDiff = (familyCounts.get(b) ?? 0) - (familyCounts.get(a) ?? 0);
    if (countDiff !== 0) return countDiff;
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

/**
 * Picks the instrument that best serves as a single entry point into the
 * catalog: the one present in the most stat families, ties broken
 * alphabetically. No hardcoded instrument — used by the demo-mode
 * `/dashboard` redirect (src/app/(dashboard)/dashboard/page.tsx), where a
 * single instrument is chosen up front instead of asking the visitor.
 */
export function pickPrimaryInstrument(catalog: StatFamilyMeta[]): string {
  return rankInstrumentsByFamilyCoverage(catalog)[0] ?? "";
}

export interface CatalogCoverage {
  /** Number of stat families in the catalog. */
  familyCount: number;
  /** Instrument codes covered by at least one family/timeframe, ranked by
   *  the number of families that cover them (descending, ties alphabetical)
   *  — see rankInstrumentsByFamilyCoverage. */
  instruments: string[];
  /** Earliest `data_range` start (ISO "YYYY-MM-DD") across every family and
   *  timeframe. Empty string when the catalog is empty. */
  earliestStart: string;
  /** Latest `data_range` end (ISO "YYYY-MM-DD") across every family and
   *  timeframe. Empty string when the catalog is empty. */
  latestEnd: string;
  /** Calendar year of earliestStart, derived once here. 0 when the catalog is empty. */
  startYear: number;
  /** Calendar year of latestEnd, derived once here. 0 when the catalog is empty. */
  endYear: number;
}

/**
 * Derives the coverage figures shown on the demo-mode landing page (family
 * count, instrument list, year range) and by DemoBanner (latest data date)
 * straight from the stat catalog — never hardcoded. Pure: no React, no
 * server-only import; callers fetch the catalog via getStatCatalog().
 */
export function getCatalogCoverage(catalog: StatFamilyMeta[]): CatalogCoverage {
  let earliestStart: string | null = null;
  let latestEnd: string | null = null;

  for (const family of catalog) {
    for (const tf of family.timeframes) {
      const [start, end] = tf.dataRange;
      if (start && (earliestStart === null || start < earliestStart)) {
        earliestStart = start;
      }
      if (end && (latestEnd === null || end > latestEnd)) {
        latestEnd = end;
      }
    }
  }

  return {
    familyCount: catalog.length,
    instruments: rankInstrumentsByFamilyCoverage(catalog),
    earliestStart: earliestStart ?? "",
    latestEnd: latestEnd ?? "",
    startYear: earliestStart ? Number(earliestStart.slice(0, 4)) : 0,
    endYear: latestEnd ? Number(latestEnd.slice(0, 4)) : 0,
  };
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
