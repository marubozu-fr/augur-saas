// Pure presentational component: renders the data section of the stat detail
// page from an already-resolved StatSliceResult. No server-only imports (no
// augur service, no subscription.server) so it can be rendered both from the
// server (StatDetail.tsx, on the initial page load) and from the client
// (StatDetailClient.tsx, after a Server Action refetch on filter change).

import { AlertTriangle } from "lucide-react";
import { makeLabelResolver } from "./helpers";
import { LockedState } from "./LockedState";
import { MagnitudeCards } from "./MagnitudeCards";
import { ProbabilityTable } from "./ProbabilityTable";
import { ConditionCard } from "./ConditionCard";
import { SliceAccordion } from "./SliceAccordion";
import { MetadataStrip } from "@/components/stat-detail/MetadataStrip";
import type { StatSliceResult } from "./load-stat-slice";
import type { StatResultRow } from "@/types/stats";

interface StatDetailContentProps {
  result: StatSliceResult;
}

export function StatDetailContent({ result }: StatDetailContentProps) {
  switch (result.kind) {
    case "locked":
      return (
        <LockedState
          title={result.title}
          definition={result.definition}
          statTier={result.statTier}
        />
      );

    case "not-found":
    case "error":
      return (
        <div className="flex flex-col items-center gap-4 py-16 px-5 text-center rounded-xl border border-dashed border-border-strong bg-muted">
          <span className="inline-grid place-items-center w-14 h-14 rounded-full bg-surface-2 text-muted-foreground">
            <AlertTriangle size={26} aria-hidden="true" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">
            Could not load stat
          </h2>
          <p className="text-sm text-muted-foreground max-w-[26rem]">
            {result.kind === "error"
              ? result.message
              : "Failed to load stat data. Please try again later."}
          </p>
          <p className="text-xs text-subtle">Refresh the page to try again.</p>
        </div>
      );

    case "no-instrument":
      return (
        <p className="text-sm text-muted-foreground">
          No data available for instrument{" "}
          <span className="font-mono">{result.instrument}</span>.
        </p>
      );

    case "no-timeframe":
      return (
        <p className="text-sm text-muted-foreground">
          No data available for timeframe{" "}
          <span className="font-mono">{result.timeframe}</span>.
        </p>
      );

    case "ok": {
      const {
        probRows,
        magnitudeRows,
        slices,
        labels,
        dataRange,
        totalSamples,
        instrument,
        timeframe,
        period,
        isCustomRange,
        statName,
      } = result;

      // Build the label resolver once; pass it down to all rendering components.
      const resolver = makeLabelResolver(labels);

      // Group probability rows by condition to decide whether the new visual
      // display (one ConditionCard per condition) applies: it requires EVERY
      // condition to be a genuine two-outcome split. Any condition with 1 or
      // 3+ outcomes falls back to the existing ProbabilityTable, unchanged.
      const rowsByCondition = new Map<string, StatResultRow[]>();
      for (const row of probRows) {
        const existing = rowsByCondition.get(row.condition);
        if (existing) existing.push(row);
        else rowsByCondition.set(row.condition, [row]);
      }
      const conditionGroups = Array.from(rowsByCondition.entries());
      const isVisualShape =
        conditionGroups.length > 0 &&
        conditionGroups.every(([, rows]) => rows.length === 2);

      return (
        <>
          {/* Metadata strip — period-aware: dataRange/totalSamples come from the
              selected TimeframeResult, which already reflects the active period.
              Hidden when the visual display is active: it then lives inside the
              shared Advanced panel below the card grid, so showing it here too
              would be redundant. */}
          {!isVisualShape && (
            <MetadataStrip
              dataRange={dataRange}
              totalSamples={totalSamples}
              isCustomRange={isCustomRange}
              period={period}
            />
          )}

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

              {isVisualShape ? (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
                  {conditionGroups.map(([conditionCode, rows]) => (
                    <ConditionCard
                      key={conditionCode}
                      conditionCode={conditionCode}
                      rows={rows}
                      resolver={resolver}
                      statName={statName}
                      timeframe={timeframe}
                    />
                  ))}
                </div>
              ) : (
                <div className="border border-border rounded-xl bg-card overflow-x-auto">
                  <ProbabilityTable
                    rows={probRows.map((row) => ({ row }))}
                    resolver={resolver}
                  />
                </div>
              )}

              <p className="mt-5 text-xs text-subtle leading-normal">
                Probabilities are observed frequencies over the selected period.
                The baseline is the same outcome&apos;s unconditional rate; edge
                is <span className="font-mono">probability − baseline</span>, in
                percentage points.
              </p>

              {/* Shared Advanced panel — the visual cards are the at-a-glance
                  layer; this single collapsible below the grid reveals the full
                  old-style view (metadata strip + the complete probability
                  table across every condition). Native <details>/<summary>
                  reuses the .accordion-chev rotation rule from globals.css, as
                  the slice accordions do. Only shown for the visual display;
                  the ProbabilityTable fallback already IS the full table. */}
              {isVisualShape && (
                <details className="mt-5">
                  <summary className="inline-flex items-center gap-2 cursor-pointer list-none text-xs font-semibold tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors [&::-webkit-details-marker]:hidden">
                    <svg
                      className="accordion-chev flex-shrink-0 text-subtle transition-transform"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                    Advanced
                  </summary>

                  <div className="pt-4">
                    <MetadataStrip
                      dataRange={dataRange}
                      totalSamples={totalSamples}
                      isCustomRange={isCustomRange}
                      period={period}
                    />

                    <div className="border border-border rounded-xl bg-card overflow-x-auto">
                      <ProbabilityTable
                        rows={probRows.map((row) => ({ row }))}
                        resolver={resolver}
                      />
                    </div>
                  </div>
                </details>
              )}
            </>
          )}

          {/* Slices accordion */}
          {slices.length > 0 && (
            <>
              <h2 className="flex items-center gap-3 text-lg font-bold tracking-tight text-foreground mt-6 mb-4">
                Sliced by dimension
                <span className="text-xs font-medium text-subtle ml-auto">
                  expand a dimension to see grouped probabilities
                </span>
              </h2>

              <div className="flex flex-col gap-3">
                {slices.map(([key, slice]) => (
                  <SliceAccordion key={key} slice={slice} resolver={resolver} />
                ))}
              </div>
            </>
          )}
        </>
      );
    }
  }
}
