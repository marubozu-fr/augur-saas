// Bespoke glyph for the `inside_bars` stat family: a large mother candle
// followed by a smaller candle whose range is fully contained within it,
// timeframe baked into the inside candle's body. Geometry copied verbatim
// from docs/mockups/stat-visual-display.html.
//
// Assumption: the mother candle's colour is the `color` prop; the inside
// candle's colour is the inverse, matching the mockup's specimen (up mother /
// down inside) and keeping the glyph visually coherent with EngulfingIcon.

import type { IconColor } from "./stat-icon-map";

interface InsideBarIconProps {
  color: IconColor;
  timeframe: string;
}

export function InsideBarIcon({ color, timeframe }: InsideBarIconProps) {
  const motherStroke = color === "up" ? "stroke-up" : "stroke-down";
  const motherFill = color === "up" ? "fill-up" : "fill-down";
  const insideColor: IconColor = color === "up" ? "down" : "up";
  const insideStroke = insideColor === "up" ? "stroke-up" : "stroke-down";
  const insideFill = insideColor === "up" ? "fill-up" : "fill-down";

  return (
    <svg
      className="flex-none"
      width={64}
      height={72}
      viewBox="0 0 64 72"
      role="img"
      aria-label={`Large candle followed by a smaller inside candle contained within its range, ${timeframe} timeframe`}
    >
      {/* Mother candle */}
      <line
        className={motherStroke}
        x1={22}
        y1={8}
        x2={22}
        y2={64}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <rect
        className={`${motherFill} ${motherStroke}`}
        x={11}
        y={18}
        width={22}
        height={36}
        rx={3}
        strokeWidth={2.5}
      />
      {/* Inside candle, contained within the mother's range */}
      <line
        className={insideStroke}
        x1={49}
        y1={28}
        x2={49}
        y2={46}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <rect
        className={`${insideFill} ${insideStroke}`}
        x={38}
        y={31}
        width={22}
        height={12}
        rx={2}
        strokeWidth={2.5}
      />
      <text
        className="fill-[rgba(3,8,6,0.82)] font-mono font-bold"
        x={49}
        y={37}
        fontSize={8}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {timeframe}
      </text>
    </svg>
  );
}
