// Instrument-specific dashboard — /dashboard/{instrument}.
// The instrument path segment is normalised (uppercased/trimmed); notFound()
// fires only for empty/whitespace-only segments. Unknown instruments fall
// through to the API's "no data" handling in StatCatalog.

import { notFound } from "next/navigation";
import { Suspense } from "react";
import { normalizeInstrument } from "@/lib/instruments";
import { StatCatalog } from "../StatCatalog";
import { StatGridSkeleton } from "../StatGridSkeleton";

interface InstrumentDashboardPageProps {
  params: Promise<{ instrument: string }>;
}

export default async function InstrumentDashboardPage({
  params,
}: InstrumentDashboardPageProps) {
  const { instrument: raw } = await params;
  const instrument = normalizeInstrument(raw);

  if (!instrument) {
    notFound();
  }

  return (
    <main className="p-6">
      {/* StatCatalog is async and fetches the Augur API.
          Wrap in Suspense keyed on instrument so switching instruments
          replays the skeleton while new data loads. */}
      <Suspense key={instrument} fallback={<StatGridSkeleton />}>
        <StatCatalog instrument={instrument} />
      </Suspense>
    </main>
  );
}
