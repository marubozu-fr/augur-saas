// Pure helpers and label resolver for rendering a StatResultRow: edge
// computation, formatting, and raw-code → human-readable label resolution.
// Shared by the stat detail page (src/app/(dashboard)/stats/[instrument]/[statId]/)
// and the marketing landing page's HeroPreviewCard — no React, no
// server-only imports, safe to import from any component.

import type { Labels } from "@/types/stats";
import type { StatResultRow } from "@/types/stats";
import { pickLocale } from "@/lib/i18n/pick";
import type { Locale } from "@/i18n/config";

// ---------------------------------------------------------------------------
// Edge calculation
// ---------------------------------------------------------------------------

/** Edge in percentage points: probability − baselineProb (both in [0,1]). */
export function computeEdge(row: StatResultRow): number {
  return row.probability - row.baselineProb;
}

export type EdgeDirection = "up" | "down" | "neutral";

export function edgeDirection(edge: number): EdgeDirection {
  if (edge > 0.0001) return "up";
  if (edge < -0.0001) return "down";
  return "neutral";
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function fmtPct(n: number): string {
  return (n * 100).toFixed(3) + "%";
}

/**
 * 1-decimal percentage formatter for the visual stat display (diverging bars,
 * default split bar, advanced-panel caption). The exact-precision `fmtPct`
 * above is reserved for the Advanced probability table.
 */
export function fmtPct1(n: number): string {
  return (n * 100).toFixed(1) + "%";
}

export function fmtEdgePts(edge: number): string {
  const pts = edge * 100;
  const sign = pts >= 0 ? "+" : "";
  return `${sign}${pts.toFixed(2)} pts`;
}

export function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}

export function fmtValue(v: number): string {
  return v.toFixed(2);
}

/**
 * Display label for a raw timeframe code — capitalizes the first letter,
 * lowercases the rest (e.g. "daily" -> "Daily", "5min" -> "5min"). Codes
 * aren't translated (no locale-specific timeframe vocabulary), so this is
 * the same in every locale. Matches the stat detail page's timeframe toggle
 * (src/components/stat-detail/DataFilterZone.tsx) — the only other place a
 * timeframe code is shown as a label.
 */
export function formatTimeframeLabel(timeframe: string): string {
  return timeframe.charAt(0).toUpperCase() + timeframe.slice(1).toLowerCase();
}

// ---------------------------------------------------------------------------
// Label resolver
// ---------------------------------------------------------------------------

export interface LabelResolver {
  condition: (code: string) => string;
  outcome: (code: string) => string;
  dimension: (code: string) => string;
}

/**
 * Builds a resolver that translates raw API codes to human-readable,
 * active-locale strings using the `labels` dictionary from the stat result.
 * Falls back to the raw code when no label is found so nothing renders blank.
 */
export function makeLabelResolver(
  labels: Labels,
  locale: Locale,
): LabelResolver {
  return {
    condition: (code) =>
      labels.conditions[code]
        ? pickLocale(labels.conditions[code], locale)
        : code,
    outcome: (code) =>
      labels.outcomes[code] ? pickLocale(labels.outcomes[code], locale) : code,
    dimension: (code) =>
      labels.dimensions[code]
        ? pickLocale(labels.dimensions[code], locale)
        : code,
  };
}
