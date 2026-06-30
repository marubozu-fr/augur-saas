/**
 * Normalises a raw instrument string (e.g. from URL path segments) to the
 * canonical uppercase code. Returns null only for empty/whitespace-only input;
 * any non-empty code is accepted as-is. Unknown instruments fall through to
 * the API's "no data" handling rather than producing a 404.
 */
export function normalizeInstrument(raw: string): string | null {
  const upper = raw.trim().toUpperCase();
  return upper.length === 0 ? null : upper;
}
