// One visual card per condition — the new default "Pattern frequency" display
// for stats whose every condition is a genuine two-outcome split (see the
// isVisualShape check in StatDetailContent). Composes: title + edge badge and
// the bespoke glyph (or DefaultStatCard fallback) + diverging bars. The full
// old-style table now lives in a single shared Advanced panel below the card
// grid, not per card. Named ConditionCard (not "StatCard") to avoid colliding
// with the unrelated dashboard StatCard.tsx.

import type { StatResultRow } from "@/types/stats";
import type {
  EdgeDirection,
  LabelResolver,
  Translator,
} from "@/lib/stat-format";
import { computeEdge, edgeDirection, fmtEdgePts } from "@/lib/stat-format";
import { DivergingBars } from "./DivergingBars";
import { DefaultStatCard } from "./DefaultStatCard";
import { renderStatIcon } from "./stat-icon-map";
import type { IconColor } from "./stat-icon-map";
import type { Locale } from "@/i18n/config";

interface ConditionCardProps {
  conditionCode: string;
  /** Exactly 2 rows — enforced by the isVisualShape check upstream. */
  rows: StatResultRow[];
  resolver: LabelResolver;
  statName: string;
  /** Full timeframe label, already resolved via formatTimeframeLabel in StatDetailContent. */
  timeframeLabel: string;
  /** Compact glyph-friendly timeframe notation (e.g. "1D"), via formatTimeframeLabel(..., { compact: true }) in StatDetailContent — only used inside the bespoke glyph's fixed-size body. */
  timeframeLabelCompact: string;
  locale: Locale;
  /** "statDetail" namespace translator — threaded down to the glyph/DivergingBars/DefaultStatCard aria-labels, which stay hook-free. */
  t: Translator;
}

export function ConditionCard({
  conditionCode,
  rows,
  resolver,
  statName,
  timeframeLabel,
  timeframeLabelCompact,
  locale,
  t,
}: ConditionCardProps) {
  const [rowA, rowB] = rows;

  // Dominant-outcome rule (edge-based): the outcome whose probability is
  // above its baseline is "dominant". Fallback for an exact tie (neither
  // outcome above baseline): deterministically treat the first row as
  // dominant. Used for the title badge (always the positive edge) and, for
  // stats without an outcome identity, for the bar assignment too.
  let dominantRow: StatResultRow;
  if (edgeDirection(computeEdge(rowA)) === "up") {
    dominantRow = rowA;
  } else if (edgeDirection(computeEdge(rowB)) === "up") {
    dominantRow = rowB;
  } else {
    // Neither outcome is strictly above its baseline (exact tie / degenerate
    // case) — deterministic fallback: treat the first row as dominant.
    dominantRow = rowA;
  }

  // Outcome-identity colour for outcomes that carry an inherent meaning
  // (e.g. a "red" or "green" session close) independent of which one
  // currently has the edge. Bar colour must reflect what the outcome means,
  // not which one is statistically dominant. null for families whose
  // outcomes aren't colour-coded, in which case we fall back to the
  // edge-based dominant/other split below.
  const outcomeIdentity: Record<string, IconColor> | null =
    statName === "opening_candle_continuation"
      ? { green_close: "up", red_close: "down" }
      : statName === "engulfing_candles"
        ? { bullish: "up", bearish: "down" }
        : null;

  // Up/down assignment rule: prefer the outcome identity when the stat has
  // one (green bar = green_close / bullish, red bar = red_close / bearish);
  // otherwise fall back to the edge-based dominant outcome as "up".
  let upRow: StatResultRow;
  let downRow: StatResultRow;
  if (outcomeIdentity) {
    if (outcomeIdentity[rowA.outcome] === "up") {
      upRow = rowA;
      downRow = rowB;
    } else {
      upRow = rowB;
      downRow = rowA;
    }
  } else {
    upRow = dominantRow;
    downRow = dominantRow === rowA ? rowB : rowA;
  }

  // Condition-identity colour for colour-coded families. opening_candle_continuation
  // encodes the candle colour in its condition code (green_open / red_open), so read
  // it directly instead of inferring from the first row's edge — the latter only
  // worked while the API happened to return outcomes in alphabetical order.
  // null for families whose conditions aren't colour-coded.
  const conditionIdentity: IconColor | null =
    statName === "opening_candle_continuation"
      ? conditionCode.startsWith("green")
        ? "up"
        : "down"
      : null;

  // Glyph colour — prefer the robust condition identity; otherwise fall back to
  // the first row's edge colour (unchanged behaviour for the other glyphs).
  const iconColor: IconColor =
    conditionIdentity ??
    (edgeDirection(computeEdge(rowA)) === "down" ? "down" : "up");
  const icon = renderStatIcon(statName, {
    color: iconColor,
    label: timeframeLabelCompact,
    fullLabel: timeframeLabel,
    t,
  });

  // Title-badge direction — mirror the condition identity so a red opening
  // candle reads red even though its dominant (above-baseline) outcome has a
  // positive edge. Families without colour-coded conditions follow the
  // up-outcome's (positive) edge — i.e. green — matching the mockup.
  const badgeDir: EdgeDirection = conditionIdentity ?? "up";
  const badgeClass =
    badgeDir === "down" ? "bg-down-soft text-down" : "bg-up-soft text-up";

  const title = resolver.condition(conditionCode);
  const subtitle = `${resolver.outcome(rowA.outcome)} vs ${resolver.outcome(rowB.outcome)}`;

  return (
    <article className="flex flex-col bg-card border border-border rounded-xl p-5 transition-colors hover:border-border-strong">
      <div className="flex items-start gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="mt-0.5 text-xs text-subtle">{subtitle}</p>
        </div>
        <div className="ml-auto flex-none">
          <span
            className={[
              "inline-flex items-center font-mono tabular-nums text-xs font-semibold px-2 py-1 rounded-full",
              badgeClass,
            ].join(" ")}
          >
            {fmtEdgePts(computeEdge(dominantRow), locale)}
          </span>
        </div>
      </div>

      {icon ? (
        <div className="flex items-start gap-5">
          {/* Offset the glyph so it centres on the diverging-bars zero axis:
              the plot is two 120px halves (240px); the 108px glyph needs
              (240 − 108) / 2 = 66px (pt-[66px]) of top padding. */}
          <div className="pt-[66px]">{icon}</div>
          <DivergingBars
            upLabel={resolver.outcome(upRow.outcome)}
            upProbability={upRow.probability}
            downLabel={resolver.outcome(downRow.outcome)}
            downProbability={downRow.probability}
            locale={locale}
            t={t}
          />
        </div>
      ) : (
        <DefaultStatCard
          upLabel={resolver.outcome(upRow.outcome)}
          upProbability={upRow.probability}
          downLabel={resolver.outcome(downRow.outcome)}
          downProbability={downRow.probability}
          locale={locale}
          t={t}
        />
      )}
    </article>
  );
}
