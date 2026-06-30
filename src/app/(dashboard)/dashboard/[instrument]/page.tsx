// Instrument-specific dashboard — /dashboard/nq, /dashboard/es.
// The instrument path segment is validated against SUPPORTED_INSTRUMENTS;
// unsupported values (e.g. /dashboard/ym) produce a 404.

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
