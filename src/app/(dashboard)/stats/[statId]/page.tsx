// Stat detail page — Server Component.
// The app shell (grid + Sidebar) is provided by the (dashboard) layout.
// This page streams the data section via <Suspense> keyed on instrument + timeframe.

import { Suspense } from "react";
import { StatDetail } from "./StatDetail";
import { StatDetailSkeleton } from "./StatDetailSkeleton";
import { StatBreadcrumb, StatBreadcrumbSkeleton } from "./StatBreadcrumb";

interface StatDetailPageProps {
  params: Promise<{ statId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function StatDetailPage({
  params,
  searchParams,
}: StatDetailPageProps) {
  // Resolve async params (Next 16 requirement)
  const { statId } = await params;
  const sp = await searchParams;

  const rawInstrument = sp["instrument"];
  const instrument =
    typeof rawInstrument === "string" ? rawInstrument : "NQ";

  const rawTimeframe = sp["timeframe"];
  const timeframe =
    typeof rawTimeframe === "string" ? rawTimeframe : "daily";

  return (
    <main className="p-6">
      {/* Breadcrumb — streams independently so the title resolves from the API. */}
      <Suspense fallback={<StatBreadcrumbSkeleton />}>
        <StatBreadcrumb statId={statId} />
      </Suspense>

      {/* Data section — streams while the API responds.
          StatDetail renders the <h1> and all content. */}
      <Suspense
        key={`${statId}-${instrument}-${timeframe}`}
        fallback={<StatDetailSkeleton />}
      >
        <StatDetail
          statId={statId}
          instrument={instrument}
          timeframe={timeframe}
        />
      </Suspense>
    </main>
  );
}
