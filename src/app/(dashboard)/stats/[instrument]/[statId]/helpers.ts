// Pure helpers and label resolver for the stat detail page.
// No React, no server-only imports — safe to import from any component in this route.

import type { Labels } from "@/types/stats";
import type { StatResultRow } from "@/types/stats";

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

// ---------------------------------------------------------------------------
// Label resolver
// ---------------------------------------------------------------------------

export interface LabelResolver {
  condition: (code: string) => string;
  outcome: (code: string) => string;
  dimension: (code: string) => string;
}

/**
 * Builds a resolver that translates raw API codes to human-readable English
 * strings using the `labels` dictionary from the stat result.
 * Falls back to the raw code when no label is found so nothing renders blank.
 */
export function makeLabelResolver(labels: Labels): LabelResolver {
  return {
    condition: (code) => labels.conditions[code]?.en ?? code,
    outcome: (code) => labels.outcomes[code]?.en ?? code,
    dimension: (code) => labels.dimensions[code]?.en ?? code,
  };
}
