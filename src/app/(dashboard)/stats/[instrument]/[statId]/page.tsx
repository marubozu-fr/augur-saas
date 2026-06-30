// Stat detail page — /stats/{instrument}/{statId}.
// The instrument path segment is normalised (uppercased/trimmed); notFound()
// fires only for empty/whitespace-only segments. Unknown instruments fall
// through to StatDetail's "no data" handling.
// Timeframe stays a query param (?timeframe=daily) — out of scope for this refactor.

import { notFound } from "next/navigation";
import { Suspense } from "react";
import { normalizeInstrument } from "@/lib/instruments";
import { StatDetail } from "./StatDetail";
import { StatDetailSkeleton } from "./StatDetailSkeleton";
import { StatBreadcrumb, StatBreadcrumbSkeleton } from "./StatBreadcrumb";

interface StatDetailPageProps {
  params: Promise<{ instrument: string; statId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function StatDetailPage({
  params,
  searchParams,
}: StatDetailPageProps) {
  // Resolve async params (Next 16 requirement)
  const { instrument: rawInstrument, statId } = await params;
  const instrument = normalizeInstrument(rawInstrument);

  if (!instrument) {
    notFound();
  }

  const sp = await searchParams;
  const rawTimeframe = sp["timeframe"];
  const timeframe =
    typeof rawTimeframe === "string" ? rawTimeframe : "daily";

  return (
    <main className="p-6">
      {/* Breadcrumb — streams independently so the title resolves from the API.
          instrument is passed so the back-links point at /dashboard/{instrument}. */}
      <Suspense fallback={<StatBreadcrumbSkeleton />}>
        <StatBreadcrumb statId={statId} instrument={instrument} />
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
