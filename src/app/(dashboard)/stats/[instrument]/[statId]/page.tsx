// Stat detail page v3 (issue #89) — /stats/{instrument}/{statId}.
// instrument is now a path segment (canonical lowercase slug) instead of a
// query param, and the URL never carries query params: timeframe, period and
// the custom start/end range are client React state owned by
// StatDetailClient, refetched via a Server Action (fetchStatSlice) when they
// change. This keeps AUGUR_API_KEY server-side while still allowing
// client-driven refetch.
//
// The stat catalog is fetched once, directly (not Suspense-wrapped, matching
// the existing dashboard/StatCatalog.tsx pattern — it's cheap and cached).
// It resolves the context-zone/data-filter-zone defaults (available
// instruments/timeframes, active values) AND supplies the title/definition
// for the header and breadcrumb.
//
// Only the actual numbers (metadata strip + magnitudes + table + slices)
// depend on the initial data fetch, so only that part is wrapped in the
// keyed <Suspense> boundary — keeping the context zone and data filter zone
// interactive while it loads, per the issue's loading-state requirement.

import { Suspense } from "react";
import { getStatCatalog } from "@/services/augur";
import {
  resolveActiveInstrument,
  resolveActiveTimeframe,
} from "@/lib/stat-context";
import { getStatTier } from "@/lib/stat-tiers";
import { StatDetailClient } from "@/components/stat-detail/StatDetailClient";
import { StatBreadcrumb } from "./StatBreadcrumb";
import { StatHeader } from "./StatHeader";
import { StatDetail } from "./StatDetail";
import { StatDetailSkeleton } from "./StatDetailSkeleton";
import type { StatFamilyMeta } from "@/types/stats";

interface StatDetailPageProps {
  params: Promise<{ instrument: string; statId: string }>;
}

export default async function StatDetailPage({ params }: StatDetailPageProps) {
  const { instrument: instrumentSlug, statId } = await params;

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
    instrumentSlug,
  );
  const activeTimeframe = resolveActiveTimeframe(
    catalog,
    statId,
    activeInstrument,
    null,
  );

  return (
    <main className="p-6">
      <StatBreadcrumb
        title={family?.title.en ?? statId}
        instrument={activeInstrument}
      />

      <StatDetailClient
        statId={statId}
        catalog={catalog}
        activeInstrument={activeInstrument}
        defaultTimeframe={activeTimeframe}
        header={
          <StatHeader
            title={family?.title.en ?? statId}
            definition={family?.definition.en ?? ""}
            tier={getStatTier(statId)}
          />
        }
      >
        <Suspense
          key={`${statId}-${activeInstrument}-${activeTimeframe}`}
          fallback={<StatDetailSkeleton />}
        >
          <StatDetail
            statId={statId}
            instrument={activeInstrument}
            timeframe={activeTimeframe}
            period="all"
            isCustomRange={false}
          />
        </Suspense>
      </StatDetailClient>
    </main>
  );
}
