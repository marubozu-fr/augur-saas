// Async Server Component: resolves the initial period-scoped stat slice via
// loadStatSlice() (server-only — never import from client components) and
// delegates rendering to the presentational StatDetailContent. Subsequent
// timeframe/period/custom-range changes are handled client-side by
// StatDetailClient via the fetchStatSlice Server Action, so this component
// only ever renders the initial slice for the current
// /stats/{instrument}/{statId} path.

import { notFound } from "next/navigation";
import { getActiveLocale } from "@/lib/i18n/get-locale";
import { loadStatSlice } from "./load-stat-slice";
import { StatDetailContent } from "./StatDetailContent";
import type { PeriodPreset } from "@/lib/period";

interface StatDetailProps {
  statId: string;
  // Canonical uppercase instrument code, already resolved in the page.
  instrument: string;
  timeframe: string;
  period: PeriodPreset;
  isCustomRange: boolean;
  // YYYY-MM-DD, present together or not at all.
  start?: string | null;
  end?: string | null;
}

export async function StatDetail({
  statId,
  instrument,
  timeframe,
  period,
  isCustomRange,
  start,
  end,
}: StatDetailProps) {
  const result = await loadStatSlice({
    statId,
    instrument,
    timeframe,
    period,
    isCustomRange,
    start,
    end,
  });

  if (result.kind === "not-found") notFound();

  const locale = await getActiveLocale();

  return <StatDetailContent result={result} locale={locale} />;
}
