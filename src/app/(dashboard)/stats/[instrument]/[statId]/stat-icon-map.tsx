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

/** Bullish/bearish colour of a glyph — mirrors the repo's up/down edge semantic. */
export type IconColor = "up" | "down";

export interface StatIconProps {
  color: IconColor;
  timeframe: string;
}

/** Renders the bespoke glyph for a stat family, or `null` for the default template. */
export function renderStatIcon(
  statName: string,
  props: StatIconProps,
): ReactElement | null {
  switch (statName) {
    case "opening_candle":
      return <CandleIcon {...props} />;
    case "engulfing_candles":
      return <EngulfingIcon {...props} />;
    case "inside_bars":
      return <InsideBarIcon {...props} />;
    default:
      return null;
  }
}
