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

// Edge-points unit suffix — not sourced from messages/*.json: it's a terse,
// mono-font unit (not full-sentence copy) tightly coupled to fmtEdgePts'
// number formatting, so it lives next to it instead of forcing every
// low-level presentational caller (ConditionCard, EdgePill, ...) to thread a
// translator through just for this one word.
const EDGE_UNIT: Record<Locale, string> = { en: "pts", fr: "pt" };

export function fmtPct(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(n);
}

/**
 * 1-decimal percentage formatter for the visual stat display (diverging bars,
 * default split bar, advanced-panel caption). The exact-precision `fmtPct`
 * above is reserved for the Advanced probability table.
 */
export function fmtPct1(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * Bare 1-decimal percentage value, with no "%" sign — for callers that
 * render the percent sign separately (e.g. DefaultStatCard's hero numeral,
 * styled at a different size than the numeral). Same decimal formatting as
 * `fmtPct1`.
 */
export function fmtPct1Value(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n * 100);
}

/**
 * The separator + percent sign a split display should render after a bare
 * numeral (`fmtPct1Value`) shown in its own DOM node, so the
 * combined text matches `fmtPct1`'s single-string spacing — a trailing sign
 * with no separator in en ("%"), a no-break space + sign in fr (" %") —
 * without a per-locale literal. Derived from `Intl.NumberFormat`'s own
 * percent formatter (`formatToParts`) rather than hardcoded.
 */
export function pctSign(locale: Locale): string {
  const parts = new Intl.NumberFormat(locale, {
    style: "percent",
  }).formatToParts(0);
  const literal = parts.find((part) => part.type === "literal")?.value ?? "";
  const sign = parts.find((part) => part.type === "percentSign")?.value ?? "%";
  return `${literal}${sign}`;
}

export function fmtEdgePts(edge: number, locale: Locale): string {
  const pts = edge * 100;
  const sign = pts >= 0 ? "+" : "";
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(pts);
  return `${sign}${formatted} ${EDGE_UNIT[locale]}`;
}

export function fmtNum(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(n);
}

// ---------------------------------------------------------------------------
// Translator (shared shape)
// ---------------------------------------------------------------------------

/**
 * Minimal shape of a next-intl translator for a single namespace —
 * structurally compatible with both `useTranslations` (client) and
 * `getTranslations` (server), without importing "next-intl" itself (this
 * file has no React/framework imports, see header comment). Used by
 * `formatTimeframeLabel` below, and re-exported for presentational
 * components (ConditionCard and its glyphs, DivergingBars, DefaultStatCard)
 * that need to render a translated string but must stay hook-free
 * themselves — the caller passes its own `useTranslations`/`getTranslations`
 * result down as a prop instead.
 */
export interface Translator {
  (key: string, values?: Record<string, string>): string;
  has(key: string): boolean;
}

// ---------------------------------------------------------------------------
// Timeframe label
// ---------------------------------------------------------------------------

// Intraday window codes look like "0930-1030" (HHMM-HHMM, 24h clock).
const WINDOW_CODE_RE = /^(\d{2})(\d{2})-(\d{2})(\d{2})$/;

export interface FormatTimeframeLabelOptions {
  /**
   * Render the terse glyph-friendly notation from "timeframes.compact"
   * (e.g. "1D" for "daily") instead of the full label — for the fixed-size
   * bespoke stat glyphs (CandleIcon, EngulfingIcon, InsideBarIcon), which
   * have no room for a full word. Falls back to the full label when the
   * code has no compact entry (e.g. intraday window codes), so this stays
   * the single entry point rather than a second lookup callers must know
   * to fall back from themselves.
   */
  compact?: boolean;
}

/**
 * Display label for a raw timeframe code, translated via the "timeframes"
 * message namespace (messages/en.json, messages/fr.json). Intraday window
 * codes (e.g. "0930-1030") aren't listed one by one — they're parsed and
 * rendered through the shared "timeframes.window"/"timeframes.windowTime"
 * patterns instead. Unknown codes (present in neither the dictionary nor the
 * window shape) fall back to the previous capitalize-first-letter heuristic
 * so nothing renders blank. Matches the stat detail page's timeframe toggle
 * (src/components/stat-detail/DataFilterZone.tsx) and the landing preview
 * card (HeroPreviewCard.tsx) — the only other places a timeframe code is
 * shown as a label.
 */
export function formatTimeframeLabel(
  timeframe: string,
  t: Translator,
  options?: FormatTimeframeLabelOptions,
): string {
  if (options?.compact) {
    const compactKey = `compact.${timeframe}`;
    if (t.has(compactKey)) return t(compactKey);
  }

  if (t.has(timeframe)) return t(timeframe);

  const match = timeframe.match(WINDOW_CODE_RE);
  if (match) {
    const [, startH, startM, endH, endM] = match;
    return t("window", {
      start: t("windowTime", { h: startH, m: startM }),
      end: t("windowTime", { h: endH, m: endM }),
    });
  }

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
