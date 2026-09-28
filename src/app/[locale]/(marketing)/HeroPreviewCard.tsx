// Hero preview card — a real sample of the member area, not invented numbers
// (issue #139). Pinned to one stat/instrument/timeframe/condition/outcome
// (gap_fill / NQ / daily / gap_up → filled) and read through the same
// getStatDetail() service the stat detail page uses, so it reflects
// whichever data source (live API or demo snapshot) is active. Reuses the
// label resolver, edge/formatting helpers (src/lib/stat-format.ts) and
// EdgePill component (src/components/stat-detail/EdgePill.tsx) shared with
// the stat detail page — no second implementation of that logic.
//
// Deviation from docs/mockups/landing.html: the mockup's row count (4,
// invented) doesn't match the real weekday slice (5 groups: Monday–Friday),
// and its hardcoded edge was positive/green. For this real condition/outcome,
// the probability sits below its baseline, so the headline number and edge
// pill render in the "down" (red) color the data actually supports. Each row
// is measured against its own baseline, which the card doesn't show, so row
// probabilities stay neutral and the row's EdgePill carries the direction.
//
// If the stat fails to load, no card is rendered — the hero renders its copy
// column alone (see the caller in page.tsx).

import NextLink from "next/link";
import { getTranslations } from "next-intl/server";
import { getActiveLocale } from "@/lib/i18n/get-locale";
import { pickLocale } from "@/lib/i18n/pick";
import { isDemoMode } from "@/lib/demo-mode";
import { getStatTier } from "@/lib/stat-tiers";
import { getStatDetail } from "@/services/augur";
import {
  computeEdge,
  edgeDirection,
  fmtNum,
  fmtPct1,
  formatTimeframeLabel,
  makeLabelResolver,
} from "@/lib/stat-format";
import { EdgePill } from "@/components/stat-detail/EdgePill";
import type { StatResultRow, StatRunResult } from "@/types/stats";

const PREVIEW_STAT_ID = "gap_fill";
const PREVIEW_INSTRUMENT = "NQ";
const PREVIEW_TIMEFRAME = "daily";
const PREVIEW_CONDITION = "gap_up";
const PREVIEW_OUTCOME = "filled";

function edgeTextClass(row: StatResultRow): string {
  const dir = edgeDirection(computeEdge(row));
  return dir === "up"
    ? "text-up"
    : dir === "down"
      ? "text-down"
      : "text-neutral";
}

export async function HeroPreviewCard() {
  const locale = await getActiveLocale();
  const t = await getTranslations("landing");
  const tStat = await getTranslations("statDetail");
  const demo = isDemoMode();

  let result: StatRunResult;
  try {
    result = await getStatDetail(PREVIEW_STAT_ID);
  } catch (err) {
    console.error("[HeroPreviewCard] getStatDetail failed", err);
    return null;
  }

  const tf = result.instruments[PREVIEW_INSTRUMENT]?.[PREVIEW_TIMEFRAME];
  const mainRow = tf?.results.find(
    (r) => r.condition === PREVIEW_CONDITION && r.outcome === PREVIEW_OUTCOME,
  );
  if (!tf || !mainRow) {
    console.error(
      "[HeroPreviewCard] preview row not found",
      PREVIEW_STAT_ID,
      PREVIEW_INSTRUMENT,
      PREVIEW_TIMEFRAME,
    );
    return null;
  }

  const resolver = makeLabelResolver(result.labels, locale);

  // Rows: the groups of one slice dimension — weekday when present,
  // otherwise the first available — for the same condition/outcome.
  const dimension = tf.slices.weekday ? "weekday" : Object.keys(tf.slices)[0];
  const slice = dimension ? tf.slices[dimension] : undefined;
  const rows: { label: string; row: StatResultRow }[] = slice
    ? Object.values(slice.groups)
        .map((group) => {
          const row = group.results.find(
            (r) =>
              r.condition === PREVIEW_CONDITION &&
              r.outcome === PREVIEW_OUTCOME,
          );
          return row ? { label: pickLocale(group.label, locale), row } : null;
        })
        .filter((entry): entry is { label: string; row: StatResultRow } =>
          Boolean(entry),
        )
    : [];

  return (
    <NextLink
      href={`/stats/${PREVIEW_INSTRUMENT.toLowerCase()}/${PREVIEW_STAT_ID}`}
      aria-label={t("hero.preview.ariaLabel")}
      className="block rounded-xl border border-border bg-card p-5 sm:p-6 shadow-[0_16px_48px_rgba(0,0,0,0.55)] hover:border-border-strong transition-colors"
    >
      {/* Card top */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="text-base font-semibold text-foreground">
            {pickLocale(result.title, locale)}
          </div>
          <div className="text-xs text-subtle mt-[2px]">
            {resolver.condition(mainRow.condition)} →{" "}
            {resolver.outcome(mainRow.outcome)} · {PREVIEW_INSTRUMENT}{" "}
            {formatTimeframeLabel(PREVIEW_TIMEFRAME)}
          </div>
        </div>
        {/* Tier badge — hidden in demo mode (every stat is unlocked there);
            in live mode, the real tier from getStatTier. */}
        {!demo && (
          <span className="inline-flex items-center gap-1 px-3 py-[5px] rounded-full text-xs font-semibold border border-border bg-surface-2 text-muted-foreground flex-shrink-0">
            {tStat("tier", { tier: getStatTier(PREVIEW_STAT_ID) })}
          </span>
        )}
      </div>

      {/* Big value row */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mb-2">
        <span
          className={`text-[3rem] font-bold leading-none font-mono tabular-nums ${edgeTextClass(mainRow)}`}
        >
          {fmtPct1(mainRow.probability)}
        </span>
        <span className="whitespace-nowrap">
          <EdgePill row={mainRow} />
        </span>
      </div>

      {/* Baseline + N — same labels as the stat detail page's MagnitudeCards */}
      <div className="text-sm text-muted-foreground">
        {tStat.rich("vsBaseline", {
          mono: (chunks) => (
            <span className="font-mono tabular-nums">{chunks}</span>
          ),
          value: fmtPct1(mainRow.baselineProb),
        })}
        {" · "}
        {tStat.rich("nEquals", {
          mono: (chunks) => (
            <span className="font-mono tabular-nums">{chunks}</span>
          ),
          count: fmtNum(mainRow.total),
        })}
      </div>

      {/* Preview rows — one slice dimension's groups */}
      {rows.length > 0 && (
        <div className="mt-5 border-t border-border">
          {rows.map(({ label, row }) => (
            // Below sm the four cells don't fit on one line, so N drops under
            // the label; from sm up: label, probability, edge, N.
            <div
              key={label}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto] sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-x-2 sm:gap-x-3 gap-y-1 items-center py-3 border-b border-border last:border-0 text-sm"
            >
              <span className="truncate text-muted-foreground">{label}</span>
              <span className="row-span-2 sm:row-span-1 font-semibold font-mono tabular-nums text-foreground">
                {fmtPct1(row.probability)}
              </span>
              <span className="row-span-2 sm:row-span-1">
                <EdgePill row={row} />
              </span>
              <span className="col-start-1 sm:col-start-auto whitespace-nowrap text-xs text-subtle font-mono tabular-nums">
                {tStat.rich("nEquals", {
                  mono: (chunks) => <>{chunks}</>,
                  count: fmtNum(row.total),
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </NextLink>
  );
}
