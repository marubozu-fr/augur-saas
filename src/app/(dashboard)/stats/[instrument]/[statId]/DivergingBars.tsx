// Diverging up/down bar chart for a single condition's two-outcome split.
// Pure presentational: the caller (ConditionCard) resolves which outcome is
// "up" (green, grows above the axis) vs "down" (red, grows below it) — see
// the up/down assignment rule documented there.

import type { CSSProperties } from "react";
import { fmtPct1 } from "@/lib/stat-format";
import type { Locale } from "@/i18n/config";
import type { Translator } from "@/lib/stat-format";

interface DivergingBarsProps {
  upLabel: string;
  upProbability: number;
  downLabel: string;
  downProbability: number;
  locale: Locale;
  /** "statDetail" namespace translator, for the aria-label sentence. */
  t: Translator;
}

// Scales a probability fraction (0..1) to the bar's pixel height. Matches the
// mockup's proportions: 100% probability fills a 116px bar inside the 120px
// half-column (the few spare px are breathing room above the zero axis).
const MAX_BAR_PX = 116;

export function DivergingBars({
  upLabel,
  upProbability,
  downLabel,
  downProbability,
  locale,
  t,
}: DivergingBarsProps) {
  const upHeight = Math.round(upProbability * MAX_BAR_PX);
  const downHeight = Math.round(downProbability * MAX_BAR_PX);
  const ariaLabel = t("divergingBarsAriaLabel", {
    upLabel,
    upValue: fmtPct1(upProbability, locale),
    downLabel,
    downValue: fmtPct1(downProbability, locale),
  });

  return (
    <div className="flex-1 min-w-0">
      <div role="img" aria-label={ariaLabel} className="flex flex-col">
        <div className="flex flex-col items-center justify-end h-[120px]">
          <span className="text-2xl font-bold leading-none mb-2 text-up">
            {fmtPct1(upProbability, locale)}
          </span>
          <div
            style={{ "--bar-h": `${upHeight}px` } as CSSProperties}
            className="w-16 max-w-[72%] h-[var(--bar-h)] bg-up rounded-t-sm"
          />
        </div>
        <div
          className="h-0 border-t border-dashed border-border-strong"
          aria-hidden="true"
        />
        <div className="flex flex-col items-center justify-start h-[120px]">
          <div
            style={{ "--bar-h": `${downHeight}px` } as CSSProperties}
            className="w-16 max-w-[72%] h-[var(--bar-h)] bg-down rounded-b-sm"
          />
          <span className="text-2xl font-bold leading-none mt-2 text-down">
            {fmtPct1(downProbability, locale)}
          </span>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
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
