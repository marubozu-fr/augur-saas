// Stat detail page v2 (issue #87) — /stats/{statId}.
// instrument, period, start/end and timeframe are now URL search params
// instead of the instrument path segment, so the page is shareable/bookmarkable.
//
// The stat catalog is fetched once, directly (not Suspense-wrapped, matching
// the existing dashboard/StatCatalog.tsx pattern — it's cheap and cached).
// It resolves the context-zone/data-filter-zone defaults (available
// instruments/timeframes, active values) AND supplies the title/definition
// for the header and breadcrumb — all of it independent of the selected
// period, so none of it needs to wait on the period-scoped data fetch below.
//
// Only the actual numbers (metadata strip + magnitudes + table + slices)
// depend on the period-scoped fetch, so only that part is wrapped in the
// keyed <Suspense> boundary — keeping the context zone and data filter zone
// interactive while it reloads, per the issue's loading-state requirement.

import { Suspense } from "react";
import { getStatCatalog } from "@/services/augur";
import { periodToDateRange } from "@/lib/period";
import {
  isIsoDate,
  isPeriodPreset,
  resolveActiveInstrument,
  resolveActiveTimeframe,
} from "@/lib/stat-context";
import { getStatTier } from "@/lib/stat-tiers";
import { StatDetailClient } from "@/components/stat-detail/StatDetailClient";
import { StatBreadcrumb } from "./StatBreadcrumb";
import { StatHeader } from "./StatHeader";
import { StatDetail } from "./StatDetail";
import { StatDetailSkeleton } from "./StatDetailSkeleton";
import type { PeriodPreset } from "@/lib/period";
import type { StatFamilyMeta } from "@/types/stats";

interface StatDetailPageProps {
  params: Promise<{ statId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function StatDetailPage({
  params,
  searchParams,
}: StatDetailPageProps) {
  const { statId } = await params;
  const sp = await searchParams;

  // -------------------------------------------------------------------------
  // Catalog — powers the context zone / data filter zone controls and the
  // header. Fetched directly (cached 5 min server-side by services/augur.ts),
  // not wrapped in its own Suspense: this keeps the whole surface above the
  // data section fast without adding another loading boundary.
  // -------------------------------------------------------------------------
  let catalog: StatFamilyMeta[] = [];
  try {
    catalog = await getStatCatalog();
  } catch (err) {
    console.error("[StatDetailPage] getStatCatalog failed", { statId }, err);
    // Swallow — StatDetail below performs its own getStatDetail(statId) call
    // and surfaces the real error/404 state. The catalog is only used to
    // pre-populate controls; losing it degrades the controls, not correctness.
  }

  const family = catalog.find((f) => f.family === statId);

  // -------------------------------------------------------------------------
  // Resolve instrument / timeframe (server-side defaults, per issue spec)
  // -------------------------------------------------------------------------
  const activeInstrument = resolveActiveInstrument(
    catalog,
    statId,
    firstParam(sp["instrument"]),
  );
  const activeTimeframe = resolveActiveTimeframe(
    catalog,
    statId,
    activeInstrument,
    firstParam(sp["timeframe"]),
  );

  // -------------------------------------------------------------------------
  // Resolve period / custom date range
  // -------------------------------------------------------------------------
  const rawPeriod = firstParam(sp["period"]);
  const period: PeriodPreset = isPeriodPreset(rawPeriod) ? rawPeriod : "all";

  const rawStart = firstParam(sp["start"]);
  const rawEnd = firstParam(sp["end"]);
  const isCustomRange = isIsoDate(rawStart) && isIsoDate(rawEnd);

  const dateRange = isCustomRange
    ? { start: rawStart, end: rawEnd }
    : periodToDateRange(period);

  return (
    <main className="p-6">
      <StatBreadcrumb
        title={family?.title.en ?? statId}
        instrument={activeInstrument}
      />

      <StatDetailClient
        statId={statId}
        catalog={catalog}
        header={
          <StatHeader
            title={family?.title.en ?? statId}
            definition={family?.definition.en ?? ""}
            tier={getStatTier(statId)}
          />
        }
      >
        <Suspense
          key={`${statId}-${activeInstrument}-${activeTimeframe}-${dateRange?.start ?? "all"}-${dateRange?.end ?? "all"}`}
          fallback={<StatDetailSkeleton />}
        >
          <StatDetail
            statId={statId}
            instrument={activeInstrument}
            timeframe={activeTimeframe}
            period={period}
            isCustomRange={isCustomRange}
            start={dateRange?.start}
            end={dateRange?.end}
          />
        </Suspense>
      </StatDetailClient>
    </main>
  );
}
