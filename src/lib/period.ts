// Period-preset → date-range conversion for the stat detail page (issue #87).
// Pure, dependency-free — safe to import from both server and client components.

export type PeriodPreset =
  | "all"
  | "1m"
  | "3m"
  | "6m"
  | "ytd"
  | "1yr"
  | "2yr"
  | "3yr"
  | "5yr"
  | "10yr";

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

// Formats using LOCAL date components (not toISOString(), which converts to
// UTC and can shift the calendar day near midnight depending on the host's
// timezone).
function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Converts a period preset to a concrete { start, end } date range.
 * Returns null for "all" (no date filtering — full historical data).
 * "end" is always today. "ytd" uses January 1 of the current year as start;
 * all other presets subtract the preset's duration from today.
 */
export function periodToDateRange(period: PeriodPreset): DateRange | null {
  if (period === "all") return null;

  const end = new Date();
  const start = new Date(end);

  switch (period) {
    case "1m":
      start.setMonth(start.getMonth() - 1);
      break;
    case "3m":
      start.setMonth(start.getMonth() - 3);
      break;
    case "6m":
      start.setMonth(start.getMonth() - 6);
      break;
    case "ytd":
      start.setMonth(0, 1);
      break;
    case "1yr":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "2yr":
      start.setFullYear(start.getFullYear() - 2);
      break;
    case "3yr":
      start.setFullYear(start.getFullYear() - 3);
      break;
    case "5yr":
      start.setFullYear(start.getFullYear() - 5);
      break;
    case "10yr":
      start.setFullYear(start.getFullYear() - 10);
      break;
  }

  return { start: toIsoDate(start), end: toIsoDate(end) };
}
