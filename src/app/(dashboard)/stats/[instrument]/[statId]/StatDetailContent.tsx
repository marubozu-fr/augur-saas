// Pure presentational component: renders the data section of the stat detail
// page from an already-resolved StatSliceResult. No server-only imports (no
// augur service, no subscription.server) so it can be rendered both from the
// server (StatDetail.tsx, on the initial page load) and from the client
// (StatDetailClient.tsx, after a Server Action refetch on filter change).

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatTimeframeLabel, makeLabelResolver } from "@/lib/stat-format";
import { LockedState } from "./LockedState";
import { MagnitudeCards } from "./MagnitudeCards";
import { ProbabilityTable } from "./ProbabilityTable";
import { ConditionCard } from "./ConditionCard";
import { SliceAccordion } from "./SliceAccordion";
import { MetadataStrip } from "@/components/stat-detail/MetadataStrip";
import type { StatSliceResult } from "./load-stat-slice";
import type { StatResultRow } from "@/types/stats";
import type { Locale } from "@/i18n/config";

interface StatDetailContentProps {
  result: StatSliceResult;
  locale: Locale;
}

export function StatDetailContent({ result, locale }: StatDetailContentProps) {
  const t = useTranslations("statDetail");
  const tTimeframes = useTranslations("timeframes");

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
            {t("couldNotLoad")}
          </h2>
          <p className="text-sm text-muted-foreground max-w-[26rem]">
            {result.kind === "error" ? result.message : t("loadFailed")}
          </p>
          <p className="text-xs text-subtle">{t("refreshToTry")}</p>
        </div>
      );

    case "no-instrument":
      return (
        <p className="text-sm text-muted-foreground">
          {t.rich("noDataForInstrument", {
            instrument: result.instrument,
            mono: (chunks) => <span className="font-mono">{chunks}</span>,
          })}
        </p>
      );

    case "no-timeframe":
      return (
        <p className="text-sm text-muted-foreground">
          {t.rich("noDataForTimeframe", {
            timeframe: result.timeframe,
            mono: (chunks) => <span className="font-mono">{chunks}</span>,
          })}
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
      const resolver = makeLabelResolver(labels, locale);

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

      // Resolved once — reused by the "continuation" caption below and by
      // every ConditionCard/glyph in the grid (all share the same timeframe).
      const timeframeLabel = formatTimeframeLabel(timeframe, tTimeframes);
      // Compact form (e.g. "1D") for the bespoke glyph's fixed-size body —
      // only ConditionCard/renderStatIcon use this one, never the caption.
      const timeframeLabelCompact = formatTimeframeLabel(
        timeframe,
        tTimeframes,
        {
          compact: true,
        },
      );

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
              locale={locale}
            />
          )}

          {/* Magnitudes section — only rendered when magnitude rows exist */}
          {magnitudeRows.length > 0 && (
            <>
              <h2 className="flex items-center gap-3 text-lg font-bold tracking-tight text-foreground mt-6 mb-4">
                {t("summarisedMagnitudes")}
                <span className="text-xs font-medium text-subtle ml-auto">
                  {t("continuation")} · {instrument} {timeframeLabel}
                </span>
              </h2>
              <MagnitudeCards
                rows={magnitudeRows}
                resolver={resolver}
                locale={locale}
              />
            </>
          )}

          {/* Pattern frequency / probability table */}
          {probRows.length > 0 && (
            <>
              <h2 className="flex items-center gap-3 text-lg font-bold tracking-tight text-foreground mt-6 mb-4">
                {t("patternFrequency")}
              </h2>

              {isVisualShape ? (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-5">
                  {conditionGroups.map(([conditionCode, rows]) => (
                    <ConditionCard
                      key={conditionCode}
                      conditionCode={conditionCode}
                      rows={rows}
                      resolver={resolver}
                      statName={statName}
                      timeframeLabel={timeframeLabel}
                      timeframeLabelCompact={timeframeLabelCompact}
                      locale={locale}
                      t={t}
                    />
                  ))}
                </div>
              ) : (
                <div className="border border-border rounded-xl bg-card overflow-x-auto">
                  <ProbabilityTable
                    rows={probRows.map((row) => ({ row }))}
                    resolver={resolver}
                    locale={locale}
                  />
                </div>
              )}

              <p className="mt-5 text-xs text-subtle leading-normal">
                {t.rich("probabilityFootnote", {
                  mono: (chunks) => <span className="font-mono">{chunks}</span>,
                })}
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
                    {t("advanced")}
                  </summary>

                  <div className="pt-4">
                    <MetadataStrip
                      dataRange={dataRange}
                      totalSamples={totalSamples}
                      isCustomRange={isCustomRange}
                      period={period}
                      locale={locale}
                    />

                    <div className="border border-border rounded-xl bg-card overflow-x-auto">
                      <ProbabilityTable
                        rows={probRows.map((row) => ({ row }))}
                        resolver={resolver}
                        locale={locale}
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
                {t("slicedByDimension")}
                <span className="text-xs font-medium text-subtle ml-auto">
                  {t("expandDimensionHint")}
                </span>
              </h2>

              <div className="flex flex-col gap-3">
                {slices.map(([key, slice]) => (
                  <SliceAccordion
                    key={key}
                    slice={slice}
                    resolver={resolver}
                    locale={locale}
                  />
                ))}
              </div>
            </>
          )}
        </>
      );
    }
  }
}
