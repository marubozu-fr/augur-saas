// Async Server Component: fetches stat detail from the Augur API,
// performs the per-stat tier check, resolves instrument/timeframe, then
// delegates rendering to the extracted presentational components.
// Never import from client components — this file touches server-only modules.

import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { getStatDetail, AugurApiError } from "@/services/augur";
import { getCurrentUserTier } from "@/lib/subscription.server";
import { canAccessStat } from "@/lib/subscription";
import { getStatTier } from "@/lib/stat-tiers";
import { makeLabelResolver } from "./helpers";
import { LockedState } from "./LockedState";
import { ControlsBar } from "./ControlsBar";
import { MagnitudeCards } from "./MagnitudeCards";
import { ProbabilityTable } from "./ProbabilityTable";
import { SliceAccordion } from "./SliceAccordion";
import type { StatRunResult } from "@/types/stats";

interface StatDetailProps {
  statId: string;
  // Canonical uppercase instrument code, already validated in the page params.
  instrument: string;
  timeframe: string;
}

export async function StatDetail({
  statId,
  instrument,
  timeframe,
}: StatDetailProps) {
  // -------------------------------------------------------------------------
  // Fetch stat detail + user tier concurrently
  // -------------------------------------------------------------------------
  let result: StatRunResult;
  let userTier: number | null;

  try {
    [result, userTier] = await Promise.all([
      getStatDetail(statId),
      getCurrentUserTier(),
    ]);
  } catch (err) {
    console.error("[StatDetail] fetch failed for", statId, { instrument, timeframe }, err);
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
  // Resolve active instrument.
  // The instrument is normalised in the page params; use it directly.
  // All instruments returned by the API are offered in the selector — the
  // route accepts any non-empty code, falling through to "no data" if the
  // API has no results for the chosen instrument.
  // -------------------------------------------------------------------------
  const availableInstruments = Object.keys(result.instruments).sort();
  const activeInstrument = instrument;

  const instrumentData = result.instruments[activeInstrument];
  if (!instrumentData) {
    return (
      <p className="text-sm text-muted-foreground">
        No data available for instrument{" "}
        <span className="font-mono">{activeInstrument}</span>.
      </p>
    );
  }

  // -------------------------------------------------------------------------
  // Resolve active timeframe (prefer "daily", fall back to first)
  // -------------------------------------------------------------------------
  const availableTimeframes = Object.keys(instrumentData);
  const defaultTimeframe = availableTimeframes.includes("daily")
    ? "daily"
    : (availableTimeframes[0] ?? "daily");
  const activeTimeframe = availableTimeframes.includes(timeframe)
    ? timeframe
    : defaultTimeframe;

  const tfResult = instrumentData[activeTimeframe];
  if (!tfResult) {
    return (
      <p className="text-sm text-muted-foreground">
        No data available for timeframe{" "}
        <span className="font-mono">{activeTimeframe}</span>.
      </p>
    );
  }

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
      {/* Stat header — title, tier badge, definition */}
      <div className="flex items-start gap-5 flex-wrap mb-5">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {result.title.en}
            </h1>
            <span className="inline-flex items-center px-3 py-[5px] rounded-full text-xs font-semibold bg-brand-soft text-brand">
              Tier {statTier}
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground leading-normal">
            {result.definition.en}
          </p>
        </div>
      </div>

      {/* Controls bar — passes statId so the instrument selector can build
          the correct /stats/{instrument}/{statId} href template */}
      <ControlsBar
        instruments={availableInstruments}
        activeInstrument={activeInstrument}
        timeframes={availableTimeframes}
        activeTimeframe={activeTimeframe}
        tfResult={tfResult}
        statId={statId}
      />

      {/* Magnitudes section — only rendered when magnitude rows exist */}
      {magnitudeRows.length > 0 && (
        <>
          <h2 className="flex items-center gap-3 text-lg font-bold tracking-tight text-foreground mt-6 mb-4">
            Summarised magnitudes
            <span className="text-xs font-medium text-subtle ml-auto">
              continuation · {activeInstrument} {activeTimeframe}
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
              probability of each outcome · {activeInstrument} {activeTimeframe}
            </span>
          </h2>

          <div className="border border-border rounded-xl bg-card overflow-x-auto">
            <ProbabilityTable
              rows={probRows.map((row) => ({ row }))}
              resolver={resolver}
            />
          </div>

          <p className="mt-5 text-xs text-subtle leading-normal">
            Probabilities are observed frequencies over the full sample. The
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
