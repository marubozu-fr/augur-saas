// Server-only data loader for the stat detail page (issue #89). Contains the
// exact fetch + tier-gate + compute logic that used to live directly in
// StatDetail.tsx, but returns a serializable discriminated union instead of
// JSX — so the same result can be rendered by the initial Server Component
// render (StatDetail.tsx) AND by the client-side Server Action refetch
// (actions.ts) that runs when timeframe/period/custom-range change.
//
// Never import this from a client component: it touches AUGUR_API_KEY via
// services/augur.ts and the Supabase-backed subscription check.

import "server-only";

import { getActiveLocale } from "@/lib/i18n/get-locale";
import {
  getStatDetail,
  getStatTimeframe,
  AugurApiError,
} from "@/services/augur";
import { getCurrentUserTier } from "@/lib/subscription.server";
import { isDemoMode } from "@/lib/demo-mode";
import { canAccessStat } from "@/lib/subscription";
import { getStatTier } from "@/lib/stat-tiers";
import { pickLocale } from "@/lib/i18n/pick";
import type {
  StatRunResult,
  TimeframeResult,
  StatResultRow,
  SliceResult,
  Labels,
} from "@/types/stats";
import { periodToDateRange } from "@/lib/period";
import type { PeriodPreset } from "@/lib/period";

export interface StatSliceInput {
  statId: string;
  instrument: string; // canonical uppercase
  timeframe: string;
  period: PeriodPreset;
  isCustomRange: boolean;
  // YYYY-MM-DD, present together or not at all.
  start?: string | null;
  end?: string | null;
}

export type StatSliceResult =
  | {
      kind: "ok";
      probRows: StatResultRow[];
      magnitudeRows: StatResultRow[];
      slices: [string, SliceResult][];
      labels: Labels;
      dataRange: string[];
      totalSamples: number;
      instrument: string;
      timeframe: string;
      period: PeriodPreset;
      isCustomRange: boolean;
      // Stat family identifier from the Augur API (raw.stat_name) — resolves
      // the bespoke glyph for the visual stat display (see stat-icon-map.tsx).
      statName: string;
    }
  | { kind: "locked"; title: string; definition: string; statTier: number }
  | { kind: "not-found" }
  | { kind: "no-instrument"; instrument: string }
  | { kind: "no-timeframe"; timeframe: string }
  | { kind: "error"; message: string };

export async function loadStatSlice({
  statId,
  instrument,
  timeframe,
  period: requestedPeriod,
  isCustomRange: requestedIsCustomRange,
  start: requestedStart,
  end: requestedEnd,
}: StatSliceInput): Promise<StatSliceResult> {
  // The snapshot backing demo mode has aggregates only (no per-session
  // samples), so period filtering is unavailable — ignore whatever the caller
  // asked for and always load the full history. ContextZone hides the period
  // presets/custom range controls in demo mode, but this is enforced here too
  // regardless of what a caller passes in.
  const demoMode = isDemoMode();
  const period: PeriodPreset = demoMode ? "all" : requestedPeriod;
  const isCustomRange = demoMode ? false : requestedIsCustomRange;
  const start = demoMode ? null : requestedStart;
  const end = demoMode ? null : requestedEnd;

  // -------------------------------------------------------------------------
  // Fetch strategy:
  //   • getStatDetail(statId) — the full family response (labels, title,
  //     definition, tier check, instrument/timeframe structure). Cached.
  //   • getStatTimeframe(...) — only when a date range is active. The granular
  //     endpoint is the only one that honours ?start=&end=, so the actual
  //     period-scoped numbers come from here (not cached).
  // When no date range is active (period "all"), the numbers come straight
  // from the family response's nested TimeframeResult.
  //
  // A period preset ("ytd", "1yr", …) is resolved to a concrete start/end here
  // via periodToDateRange — otherwise the preset would be silently ignored and
  // full-history numbers returned. A custom range takes precedence over the
  // preset. "all" resolves to null → no date filtering.
  // -------------------------------------------------------------------------
  const resolvedRange =
    isCustomRange && start && end ? { start, end } : periodToDateRange(period);
  const dateFiltered = resolvedRange !== null;
  const effectiveStart = resolvedRange?.start ?? null;
  const effectiveEnd = resolvedRange?.end ?? null;

  let result: StatRunResult;
  let userTier: number | null;
  let filteredTf: TimeframeResult | null;

  try {
    [result, userTier, filteredTf] = await Promise.all([
      getStatDetail(statId),
      getCurrentUserTier(),
      dateFiltered
        ? getStatTimeframe(statId, instrument, timeframe, {
            start: effectiveStart ?? undefined,
            end: effectiveEnd ?? undefined,
          })
        : Promise.resolve(null),
    ]);
  } catch (err) {
    console.error(
      "[loadStatSlice] fetch failed for",
      statId,
      { instrument, timeframe, start: effectiveStart, end: effectiveEnd },
      err,
    );
    if (err instanceof AugurApiError && err.status === 404) {
      return { kind: "not-found" };
    }

    const message =
      err instanceof AugurApiError
        ? err.message
        : "Failed to load stat data. Please try again later.";

    return { kind: "error", message };
  }

  // -------------------------------------------------------------------------
  // Per-stat tier gate
  // -------------------------------------------------------------------------
  const statTier = getStatTier(statId);
  if (!canAccessStat(userTier, statTier)) {
    const locale = await getActiveLocale();
    return {
      kind: "locked",
      title: pickLocale(result.title, locale),
      definition: pickLocale(result.definition, locale),
      statTier,
    };
  }

  // -------------------------------------------------------------------------
  // Resolve active instrument / timeframe against the actual response. The
  // caller already resolved these from the catalog, but the catalog and the
  // period-scoped response are separate fetches — re-validate defensively
  // rather than assume they always agree.
  // -------------------------------------------------------------------------
  const instrumentData = result.instruments[instrument];
  if (!instrumentData) {
    return { kind: "no-instrument", instrument };
  }

  const baseTf = instrumentData[timeframe];
  if (!baseTf) {
    return { kind: "no-timeframe", timeframe };
  }

  // Render the period-scoped numbers when a date range is active; otherwise the
  // full-history numbers from the family response. Structural validation above
  // always uses the family response, which is the canonical source of truth for
  // which instruments/timeframes exist.
  const tfResult = filteredTf ?? baseTf;

  // -------------------------------------------------------------------------
  // Partition results: probability rows vs magnitude rows.
  // A row is a "magnitude" when probability === 0.0 (sentinel) and value != null.
  // -------------------------------------------------------------------------
  const probRows = tfResult.results.filter(
    (r) => !(r.probability === 0 && r.value != null),
  );
  const magnitudeRows = tfResult.results.filter(
    (r) => r.probability === 0 && r.value != null,
  );

  const slices = Object.entries(tfResult.slices);

  return {
    kind: "ok",
    probRows,
    magnitudeRows,
    slices,
    labels: result.labels,
    dataRange: tfResult.dataRange,
    totalSamples: tfResult.totalSamples,
    instrument,
    timeframe,
    period,
    isCustomRange,
    statName: result.statName,
  };
}
