// Async Server Component: fetches the period-scoped stat detail from the
// Augur API, performs the per-stat tier check, resolves instrument/timeframe
// data, then delegates rendering to the extracted presentational components.
// Never import from client components — this file touches server-only modules.
//
// The page title / tier badge / definition are now rendered by StatHeader
// (page.tsx), outside this component's Suspense boundary, since they don't
// depend on the selected period. This component owns everything that DOES —
// the metadata strip, magnitudes, pattern-frequency table and slices — plus
// the tier gate (LockedState, unchanged, replaces all of it when locked).

import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import {
  getStatDetail,
  getStatTimeframe,
  AugurApiError,
} from "@/services/augur";
import { getCurrentUserTier } from "@/lib/subscription.server";
import { canAccessStat } from "@/lib/subscription";
import { getStatTier } from "@/lib/stat-tiers";
import { makeLabelResolver } from "./helpers";
import { LockedState } from "./LockedState";
import { MagnitudeCards } from "./MagnitudeCards";
import { ProbabilityTable } from "./ProbabilityTable";
import { SliceAccordion } from "./SliceAccordion";
import { MetadataStrip } from "@/components/stat-detail/MetadataStrip";
import type { StatRunResult, TimeframeResult } from "@/types/stats";
import type { PeriodPreset } from "@/lib/period";

interface StatDetailProps {
  statId: string;
  // Canonical uppercase instrument code, already resolved in the page.
  instrument: string;
  timeframe: string;
  period: PeriodPreset;
  isCustomRange: boolean;
  // YYYY-MM-DD, present together or not at all.
  start?: string | null;
  end?: string | null;
}

export async function StatDetail({
  statId,
  instrument,
  timeframe,
  period,
  isCustomRange,
  start,
  end,
}: StatDetailProps) {
  // -------------------------------------------------------------------------
  // Fetch strategy:
  //   • getStatDetail(statId) — the full family response (labels, title,
  //     definition, tier check, instrument/timeframe structure). Cached.
  //   • getStatTimeframe(...) — only when a date range is active. The granular
  //     endpoint is the only one that honours ?start=&end=, so the actual
  //     period-scoped numbers come from here (not cached).
  // When no date range is active, the numbers come straight from the family
  // response's nested TimeframeResult (unchanged from the original behavior).
  // -------------------------------------------------------------------------
  const dateFiltered = Boolean(start && end);

  let result: StatRunResult;
  let userTier: number | null;
  let filteredTf: TimeframeResult | null;

  try {
    [result, userTier, filteredTf] = await Promise.all([
      getStatDetail(statId),
      getCurrentUserTier(),
      dateFiltered
        ? getStatTimeframe(statId, instrument, timeframe, {
            start: start ?? undefined,
            end: end ?? undefined,
          })
        : Promise.resolve(null),
    ]);
  } catch (err) {
    console.error(
      "[StatDetail] fetch failed for",
      statId,
      { instrument, timeframe, start, end },
      err,
    );
    if (err instanceof AugurApiError && err.status === 404) {
      notFound();
    }

    const message =
      err instanceof AugurApiError
        ? err.message
        : "Failed to load stat data. Please try again later.";

    return (
      <div className="flex flex-col items-center gap-4 py-16 px-5 text-center rounded-xl border border-dashed border-border-strong bg-muted">
        <span className="inline-grid place-items-center w-14 h-14 rounded-full bg-surface-2 text-muted-foreground">
          <AlertTriangle size={26} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">
          Could not load stat
        </h2>
        <p className="text-sm text-muted-foreground max-w-[26rem]">{message}</p>
        <p className="text-xs text-subtle">Refresh the page to try again.</p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Per-stat tier gate
  // -------------------------------------------------------------------------
  const statTier = getStatTier(statId);
  if (!canAccessStat(userTier, statTier)) {
    return <LockedState result={result} statTier={statTier} />;
  }

  // -------------------------------------------------------------------------
  // Resolve active instrument / timeframe against the actual response. The
  // page already resolved these from the catalog, but the catalog and the
  // period-scoped response are separate fetches — re-validate defensively
  // rather than assume they always agree.
  // -------------------------------------------------------------------------
  const instrumentData = result.instruments[instrument];
  if (!instrumentData) {
    return (
      <p className="text-sm text-muted-foreground">
        No data available for instrument{" "}
        <span className="font-mono">{instrument}</span>.
      </p>
    );
  }

  const baseTf = instrumentData[timeframe];
  if (!baseTf) {
    return (
      <p className="text-sm text-muted-foreground">
        No data available for timeframe{" "}
        <span className="font-mono">{timeframe}</span>.
      </p>
    );
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

  const sliceEntries = Object.entries(tfResult.slices);

  // Build the label resolver once; pass it down to all rendering components.
  const resolver = makeLabelResolver(result.labels);

  return (
    <>
      {/* Metadata strip — period-aware: dataRange/totalSamples come from the
          selected TimeframeResult, which already reflects the active period. */}
      <MetadataStrip
        dataRange={tfResult.dataRange}
        totalSamples={tfResult.totalSamples}
        isCustomRange={isCustomRange}
        period={period}
      />

      {/* Magnitudes section — only rendered when magnitude rows exist */}
      {magnitudeRows.length > 0 && (
        <>
          <h2 className="flex items-center gap-3 text-lg font-bold tracking-tight text-foreground mt-6 mb-4">
            Summarised magnitudes
            <span className="text-xs font-medium text-subtle ml-auto">
              continuation · {instrument} {timeframe}
            </span>
          </h2>
          <MagnitudeCards rows={magnitudeRows} resolver={resolver} />
        </>
      )}

      {/* Pattern frequency / probability table */}
      {probRows.length > 0 && (
        <>
          <h2 className="flex items-center gap-3 text-lg font-bold tracking-tight text-foreground mt-6 mb-4">
            Pattern frequency
            <span className="text-xs font-medium text-subtle ml-auto">
              probability of each outcome · {instrument} {timeframe}
            </span>
          </h2>

          <div className="border border-border rounded-xl bg-card overflow-x-auto">
            <ProbabilityTable
              rows={probRows.map((row) => ({ row }))}
              resolver={resolver}
            />
          </div>

          <p className="mt-5 text-xs text-subtle leading-normal">
            Probabilities are observed frequencies over the selected period. The
            baseline is the same outcome&apos;s unconditional rate; edge is{" "}
            <span className="font-mono">probability − baseline</span>, in
            percentage points.
          </p>
        </>
      )}

      {/* Slices accordion */}
      {sliceEntries.length > 0 && (
        <>
          <h2 className="flex items-center gap-3 text-lg font-bold tracking-tight text-foreground mt-6 mb-4">
            Sliced by dimension
            <span className="text-xs font-medium text-subtle ml-auto">
              expand a dimension to see grouped probabilities
            </span>
          </h2>

          <div className="flex flex-col gap-3">
            {sliceEntries.map(([key, slice]) => (
              <SliceAccordion key={key} slice={slice} resolver={resolver} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
