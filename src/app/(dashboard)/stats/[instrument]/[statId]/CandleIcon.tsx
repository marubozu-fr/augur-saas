// Bespoke glyph for the `opening_candle` stat family: a single candlestick
// with the timeframe baked into the body. Geometry copied verbatim from
// docs/mockups/stat-visual-display.html (the single-candle specimen).

import type { IconColor } from "./stat-icon-map";

interface CandleIconProps {
  color: IconColor;
  timeframe: string;
}

export function CandleIcon({ color, timeframe }: CandleIconProps) {
  const strokeClass = color === "up" ? "stroke-up" : "stroke-down";
  const fillClass = color === "up" ? "fill-up" : "fill-down";
  const label =
    color === "up"
      ? `Single green (bullish) candlestick, ${timeframe} timeframe`
      : `Single red (bearish) candlestick, ${timeframe} timeframe`;

  return (
    <svg
      className="flex-none"
      width={64}
      height={72}
      viewBox="0 0 64 72"
      role="img"
      aria-label={label}
    >
      <line
        className={strokeClass}
        x1={32}
        y1={6}
        x2={32}
        y2={66}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <rect
        className={`${fillClass} ${strokeClass}`}
        x={15}
        y={22}
        width={34}
        height={28}
        rx={3}
        strokeWidth={2.5}
      />
      <text
        className="fill-[rgba(3,8,6,0.82)] font-mono font-bold"
        x={32}
        y={37}
        fontSize={12}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {timeframe}
      </text>
    </svg>
  );
}
