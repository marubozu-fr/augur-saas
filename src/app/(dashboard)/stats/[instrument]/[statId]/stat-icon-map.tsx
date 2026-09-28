// Maps a stat family's `statName` (from the Augur API, see StatRunResult) to
// its bespoke glyph for the visual stat display (issue #96). Any stat not
// listed here has no custom icon — ConditionCard falls back to the generic
// DefaultStatCard template instead. Designed to grow: add one `case` per
// bespoke glyph as new icons are designed.
//
// renderStatIcon returns an already-built ReactElement (rather than handing
// back a component reference for the caller to instantiate) so every JSX tag
// below resolves to a statically-imported component — required by the
// react-hooks/static-components lint rule, which flags components
// constructed from a variable at render time.

import type { ReactElement } from "react";
import { CandleIcon } from "./CandleIcon";
import { EngulfingIcon } from "./EngulfingIcon";
import { InsideBarIcon } from "./InsideBarIcon";
import type { Translator } from "@/lib/stat-format";

/** Bullish/bearish colour of a glyph — mirrors the repo's up/down edge semantic. */
export type IconColor = "up" | "down";

export interface StatIconProps {
  color: IconColor;
  /**
   * Compact glyph-friendly timeframe notation (e.g. "1D" for "daily"),
   * already resolved via formatTimeframeLabel(..., { compact: true }) at
   * the call site (ConditionCard) — this is what's drawn inside the glyph.
   */
  label: string;
  /**
   * Full timeframe label (e.g. "Daily"), also resolved at the call site —
   * used only inside the aria-label sentence, which has room to spell it
   * out even though the glyph itself doesn't.
   */
  fullLabel: string;
  /** "statDetail" namespace translator, for this glyph's aria-label sentence — see stat-format.ts's Translator. */
  t: Translator;
}

/** Renders the bespoke glyph for a stat family, or `null` for the default template. */
export function renderStatIcon(
  statName: string,
  props: StatIconProps,
): ReactElement | null {
  switch (statName) {
    case "opening_candle_continuation":
      return <CandleIcon {...props} />;
    case "engulfing_candles":
      return <EngulfingIcon {...props} />;
    case "inside_bars":
      return <InsideBarIcon {...props} />;
    default:
      return null;
  }
}
