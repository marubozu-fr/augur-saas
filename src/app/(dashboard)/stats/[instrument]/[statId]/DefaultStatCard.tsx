// Fallback body for stats without a bespoke glyph (stat-icon-map.tsx returns
// null): a colored dot + hero % + outcome label, plus a horizontal green/red
// split bar (the mockup's `.splitbar` pattern). Pure presentational — the up
// outcome (green) is always the hero, per the repo's up/down colour semantic.
//
// Deviation from the mockup: the mockup's hero label is bespoke stat copy
// ("fill same session"). Our generic data model only has the resolved
// outcome label, so that label is reused as the hero caption here.

import type { CSSProperties } from "react";
import { fmtPct1 } from "@/lib/stat-format";

interface DefaultStatCardProps {
  upLabel: string;
  upProbability: number;
  downLabel: string;
  downProbability: number;
}

export function DefaultStatCard({
  upLabel,
  upProbability,
  downLabel,
  downProbability,
}: DefaultStatCardProps) {
  const upPct = upProbability * 100;
  const downPct = downProbability * 100;

  return (
    <div>
      <div className="flex items-baseline gap-3 mt-2 mb-4">
        <span
          className="w-[0.7rem] h-[0.7rem] rounded-full self-center flex-none bg-up ring-4 ring-up-soft"
          aria-hidden="true"
        />
        <span className="font-mono tabular-nums text-4xl font-bold leading-none text-up">
          {upPct.toFixed(1)}
          <span className="text-2xl font-bold">%</span>
        </span>
        <span className="text-sm text-muted-foreground">{upLabel}</span>
      </div>

      <div
        role="img"
        aria-label={`${upLabel} ${fmtPct1(upProbability)} (green); ${downLabel} ${fmtPct1(downProbability)} (red)`}
        className="flex h-10 rounded-md overflow-hidden border border-border"
      >
        <div
          style={{ "--w": `${upPct}%` } as CSSProperties}
          className="flex items-center justify-center w-[var(--w)] font-mono tabular-nums text-sm font-bold text-[rgba(3,8,6,0.82)] whitespace-nowrap bg-up"
        >
          {fmtPct1(upProbability)}
        </div>
        <div
          style={{ "--w": `${downPct}%` } as CSSProperties}
          className="flex items-center justify-center w-[var(--w)] font-mono tabular-nums text-sm font-bold text-[rgba(3,8,6,0.82)] whitespace-nowrap bg-down"
        >
          {fmtPct1(downProbability)}
        </div>
      </div>

      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <i
            className="w-2.5 h-2.5 rounded-sm bg-up flex-none"
            aria-hidden="true"
          />
          {upLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <i
            className="w-2.5 h-2.5 rounded-sm bg-down flex-none"
            aria-hidden="true"
          />
          {downLabel}
        </span>
      </div>
    </div>
  );
}
