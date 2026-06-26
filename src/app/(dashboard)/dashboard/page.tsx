// Member dashboard — server component.
// The app shell (grid + Sidebar) is provided by the (dashboard) layout.
// This page streams the catalog content via <Suspense>/<StatCatalog>.

import { Suspense } from "react";
import { getCurrentUserTier } from "@/lib/subscription.server";
import { Topbar } from "@/app/(dashboard)/Topbar";
import { StatCatalog } from "./StatCatalog";
import { StatGridSkeleton } from "./StatGridSkeleton";

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  // Resolve async searchParams (Next 16 requirement)
  const params = await searchParams;
  const rawInstrument = params["instrument"];
  const instrument =
    typeof rawInstrument === "string" ? rawInstrument : "NQ";

  // Fetch tier for the topbar tier pill — fail open so the shell always renders.
  // Next dedupes the underlying getUser call with the one in DashboardLayout.
  let userTier: number | null = null;
  try {
    userTier = await getCurrentUserTier();
  } catch (err) {
    console.error("[DashboardPage] getCurrentUserTier failed", { instrument }, err);
    userTier = null;
  }

  return (
    <>
      <Topbar userTier={userTier} />

      <main className="p-6">
        {/* StatCatalog is async and fetches the Augur API.
            Wrap in Suspense keyed on instrument so switching instruments
            replays the skeleton while new data loads. */}
        <Suspense key={instrument} fallback={<StatGridSkeleton />}>
          <StatCatalog instrument={instrument} />
        </Suspense>
      </main>
    </>
  );
}
