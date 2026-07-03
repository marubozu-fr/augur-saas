// Bespoke glyph for the `engulfing_candles` stat family: a small candle
// engulfed by a larger, opposite-colour candle, timeframe baked into the
// large (signal) candle's body. Geometry copied verbatim from
// docs/mockups/stat-visual-display.html.
//
// Assumption: an engulfing pattern is, by definition, a small candle followed
// by an opposite-coloured larger candle — so the small candle's colour is
// always the inverse of the `color` prop (the large/signal candle's colour).

import type { IconColor } from "./stat-icon-map";

interface EngulfingIconProps {
  color: IconColor;
  timeframe: string;
}

export function EngulfingIcon({ color, timeframe }: EngulfingIconProps) {
  const largeStroke = color === "up" ? "stroke-up" : "stroke-down";
  const largeFill = color === "up" ? "fill-up" : "fill-down";
  const smallColor: IconColor = color === "up" ? "down" : "up";
  const smallStroke = smallColor === "up" ? "stroke-up" : "stroke-down";
  const smallFill = smallColor === "up" ? "fill-up" : "fill-down";
  const label =
    color === "up"
      ? `Small bearish candle engulfed by a large bullish candle, ${timeframe} timeframe`
      : `Small bullish candle engulfed by a large bearish candle, ${timeframe} timeframe`;

  return (
    <svg
      className="flex-none"
      width={96}
      height={108}
      viewBox="0 0 64 72"
      role="img"
      aria-label={label}
    >
      {/* Small, engulfed candle */}
      <line
        className={smallStroke}
        x1={20}
        y1={26}
        x2={20}
        y2={48}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <rect
        className={`${smallFill} ${smallStroke}`}
        x={12}
        y={30}
        width={16}
        height={14}
        rx={2}
        strokeWidth={2.5}
      />
      {/* Large, engulfing (signal) candle */}
      <line
        className={largeStroke}
        x1={44}
        y1={12}
        x2={44}
        y2={62}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <rect
        className={`${largeFill} ${largeStroke}`}
        x={33}
        y={20}
        width={22}
        height={34}
        rx={3}
        strokeWidth={2.5}
      />
      <text
        className="fill-[rgba(3,8,6,0.82)] font-mono font-bold"
        x={44}
        y={37}
        fontSize={10}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {timeframe}
      </text>
    </svg>
  );
}
