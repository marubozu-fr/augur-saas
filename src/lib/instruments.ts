export const INSTRUMENT_NAMES: Record<string, string> = {
  NQ: "Nasdaq 100",
  ES: "S&P 500",
  YM: "Dow Jones 30",
  RTY: "Russell 2000",
};

export function getInstrumentName(code: string): string {
  return INSTRUMENT_NAMES[code] ?? code;
}

// The two instruments supported by path-based routing (/dashboard/nq, /stats/es/…).
// Other instruments from the API (YM, RTY) are display-only and have no routed path.
export const SUPPORTED_INSTRUMENTS = ["NQ", "ES"] as const;

export type SupportedInstrument = (typeof SUPPORTED_INSTRUMENTS)[number];

/**
 * Normalises a raw instrument string (e.g. from URL path segments) to the
 * canonical uppercase code, or null when the value is not in SUPPORTED_INSTRUMENTS.
 * Case-insensitive: "nq", "NQ", "Nq" all return "NQ".
 */
export function normalizeInstrument(raw: string): SupportedInstrument | null {
  const upper = raw.toUpperCase();
  if (upper === "NQ" || upper === "ES") return upper;
  return null;
}
