// One visual card per condition — the new default "Pattern frequency" display
// for stats whose every condition is a genuine two-outcome split (see the
// isVisualShape check in StatDetailContent). Composes: title + edge badge,
// the bespoke glyph (or DefaultStatCard fallback) + diverging bars, and the
// collapsible Advanced panel. Named ConditionCard (not "StatCard") to avoid
// colliding with the unrelated dashboard StatCard.tsx.

import type { StatResultRow } from "@/types/stats";
import type { PeriodPreset } from "@/lib/period";
import type { EdgeDirection, LabelResolver } from "./helpers";
import { computeEdge, edgeDirection, fmtEdgePts } from "./helpers";
import { DivergingBars } from "./DivergingBars";
import { DefaultStatCard } from "./DefaultStatCard";
import { AdvancedPanel } from "./AdvancedPanel";
import { renderStatIcon } from "./stat-icon-map";
import type { IconColor } from "./stat-icon-map";

interface ConditionCardProps {
  conditionCode: string;
  /** Exactly 2 rows — enforced by the isVisualShape check upstream. */
  rows: StatResultRow[];
  resolver: LabelResolver;
  statName: string;
  timeframe: string;
  dataRange: string[];
  totalSamples: number;
  isCustomRange: boolean;
  period: PeriodPreset;
}

export function ConditionCard({
  conditionCode,
  rows,
  resolver,
  statName,
  timeframe,
  dataRange,
  totalSamples,
  isCustomRange,
  period,
}: ConditionCardProps) {
  const [rowA, rowB] = rows;

  // Up/down assignment rule: the outcome whose probability is above its
  // baseline is the green "up" bar; the other outcome (necessarily below its
  // baseline in a complementary 2-way split) is the red "down" bar. Matches
  // the repo's documented colour semantic (green = above baseline, red =
  // below). Fallback for an exact tie (neither outcome above baseline):
  // deterministically treat the first row as "up".
  let upRow: StatResultRow;
  let downRow: StatResultRow;
  if (edgeDirection(computeEdge(rowA)) === "up") {
    upRow = rowA;
    downRow = rowB;
  } else if (edgeDirection(computeEdge(rowB)) === "up") {
    upRow = rowB;
    downRow = rowA;
  } else {
    // Neither outcome is strictly above its baseline (exact tie / degenerate
    // case) — deterministic fallback: treat the first row as "up".
    upRow = rowA;
    downRow = rowB;
  }

  // Condition-identity colour for colour-coded families. opening_candle encodes
  // the candle colour in its condition code (green_open / red_open), so read it
  // directly instead of inferring from the first row's edge — the latter only
  // worked while the API happened to return outcomes in alphabetical order.
  // null for families whose conditions aren't colour-coded.
  const conditionIdentity: IconColor | null =
    statName === "opening_candle"
      ? conditionCode.startsWith("green")
        ? "up"
        : "down"
      : null;

  // Glyph colour — prefer the robust condition identity; otherwise fall back to
  // the first row's edge colour (unchanged behaviour for the other glyphs).
  const iconColor: IconColor =
    conditionIdentity ??
    (edgeDirection(computeEdge(rowA)) === "down" ? "down" : "up");
  const icon = renderStatIcon(statName, { color: iconColor, timeframe });

  // Title-badge direction — mirror the condition identity so a red opening
  // candle reads red even though its dominant (above-baseline) outcome has a
  // positive edge. Families without colour-coded conditions follow the
  // up-outcome's (positive) edge — i.e. green — matching the mockup.
  const badgeDir: EdgeDirection = conditionIdentity ?? "up";
  const badgeClass =
    badgeDir === "down" ? "bg-down-soft text-down" : "bg-up-soft text-up";

  const title = resolver.condition(conditionCode);
  const subtitle = `${resolver.outcome(rowA.outcome)} vs ${resolver.outcome(rowB.outcome)}`;

  const tableRows = rows.map((row) => ({ row }));

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
            {fmtEdgePts(computeEdge(upRow))}
          </span>
        </div>
      </div>

      {icon ? (
        <div className="flex items-start gap-5">
          {/* Offset the glyph so it centres on the diverging-bars zero axis:
              the plot is two 84px halves (168px); the 72px glyph needs
              (168 − 72) / 2 = 48px (pt-12) of top padding. */}
          <div className="pt-12">{icon}</div>
          <DivergingBars
            upLabel={resolver.outcome(upRow.outcome)}
            upProbability={upRow.probability}
            downLabel={resolver.outcome(downRow.outcome)}
            downProbability={downRow.probability}
          />
        </div>
      ) : (
        <DefaultStatCard
          upLabel={resolver.outcome(upRow.outcome)}
          upProbability={upRow.probability}
          downLabel={resolver.outcome(downRow.outcome)}
          downProbability={downRow.probability}
        />
      )}

      <AdvancedPanel
        upRow={upRow}
        rows={tableRows}
        resolver={resolver}
        dataRange={dataRange}
        totalSamples={totalSamples}
        isCustomRange={isCustomRange}
        period={period}
      />
    </article>
  );
}
