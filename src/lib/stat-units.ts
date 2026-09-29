// Per-family display unit of magnitude values (StatResultRow.value /
// valueBaseline). The Augur API result carries no unit metadata, so the unit
// is mapped here, keyed by stat family. Each entry was checked against the
// backend compute module (marubozu-fr/augur, stats/<family>/standard.py) and
// the sample values in demo-data/results/. Pure helpers, no React.

import type { Locale } from "@/i18n/config";
import type { Translator } from "@/lib/stat-format";
import { pctSign } from "@/lib/stat-format";

export type MagnitudeUnit =
  /** Value already in percent points (2.99 = 2.99%): show as-is with a "%". */
  | "percent"
  /** Decimal fraction (0.012 = 1.2%): multiplied by 100, shown with a "%". */
  | "fraction"
  /** Index points (price distance). */
  | "points"
  /** Number of bars. */
  | "bars"
  /** Traded futures volume, counted in contracts (whole numbers). */
  | "volume"
  /** Dimensionless (correlation coefficient): no unit. */
  | "none";

interface FamilyUnits {
  /** Unit of every outcome not listed in `outcomes`. */
  default: MagnitudeUnit;
  /** Per-outcome overrides, for families mixing several units. */
  outcomes?: Record<string, MagnitudeUnit>;
}

// A family absent from this map has no unit (never an implicit percent).
const FAMILY_UNITS: Record<string, FamilyUnits> = {
  avg_consecutive_bars: { default: "bars" },
  cpi_performance: { default: "fraction" },
  economic_data_volume: { default: "volume" },
  engulfing_candles: { default: "percent" },
  fomc_performance: { default: "fraction" },
  initial_balance_performance: {
    default: "points",
    outcomes: { mean_extension_pct: "fraction", max_extension_pct: "fraction" },
  },
  intraday_range_window: {
    default: "points",
    outcomes: {
      range_pct_avg: "fraction",
      range_pct_max: "fraction",
      range_pct_min: "fraction",
      range_pct_median: "fraction",
    },
  },
  market_open_volume: { default: "none" },
  nfp_performance: { default: "fraction" },
  opening_range_indicator: {
    default: "points",
    outcomes: { opening_range_share: "fraction", correlation: "none" },
  },
  performance_weekday: { default: "fraction" },
  seasonality: { default: "fraction" },
  session_range_weekday: { default: "points" },
  session_reversal_range: {
    default: "points",
    outcomes: { mean_reversal_pct: "fraction", max_reversal_pct: "fraction" },
  },
  session_volume_weekday: { default: "volume" },
  sma_performance: {
    default: "points",
    outcomes: { avg_duration: "bars", max_duration: "bars" },
  },
  volume_range_weekday: {
    default: "points",
    outcomes: { mean_volume: "volume", mean_range_pct: "fraction" },
  },
  volume_trends: { default: "volume" },
};

export function getMagnitudeUnit(
  family: string,
  outcome: string,
): MagnitudeUnit {
  const units = FAMILY_UNITS[family];
  if (!units) return "none";
  return units.outcomes?.[outcome] ?? units.default;
}

export interface FormattedMagnitude {
  /** Locale-formatted number, digit-grouped, scaled for the unit. */
  number: string;
  /** Unit suffix, or null when the value has none. */
  suffix: string | null;
  /** Whether the suffix is glued to the number (percent sign) or a spaced word. */
  glued: boolean;
}

export function formatMagnitude(
  value: number,
  unit: MagnitudeUnit,
  locale: Locale,
  t: Translator,
): FormattedMagnitude {
  const scaled = unit === "fraction" ? value * 100 : value;
  const digits = unit === "volume" ? 0 : 2;
  const number = new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(scaled);
  switch (unit) {
    case "percent":
    case "fraction":
      return { number, suffix: pctSign(locale), glued: true };
    case "points":
      return { number, suffix: t("unitPoints"), glued: false };
    case "bars":
      return { number, suffix: t("unitBars"), glued: false };
    case "volume":
      return { number, suffix: t("unitContracts"), glued: false };
    default:
      return { number, suffix: null, glued: false };
  }
}

/** Single-string form, for inline copy such as the "vs X baseline" line. */
export function formatMagnitudeInline(f: FormattedMagnitude): string {
  if (f.suffix === null) return f.number;
  return f.glued ? `${f.number}${f.suffix}` : `${f.number} ${f.suffix}`;
}
