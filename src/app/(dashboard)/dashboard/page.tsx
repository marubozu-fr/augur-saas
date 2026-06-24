// Member dashboard — server component.
// Renders the app shell (Sidebar + Topbar) immediately, then streams the
// catalog content via <Suspense>/<StatCatalog> once the Augur API responds.

import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserTier } from "@/lib/subscription.server";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
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

  // Fetch user for the sidebar
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email ?? "";

  // Fetch tier for the topbar tier pill — guard separately so the shell always
  // renders even if the subscription query fails.
  let userTier: number | null = null;
  try {
    userTier = await getCurrentUserTier();
  } catch {
    // Fail open — no tier displayed, no crash
    userTier = null;
  }

  return (
    <div className="grid md:grid-cols-[248px_1fr] min-h-screen">
      {/* Sidebar — desktop only (hidden below md) */}
      <Sidebar userEmail={userEmail} />

      {/* Content column */}
      <div className="flex flex-col min-w-0">
        <Topbar userTier={userTier} />

        <main className="p-6">
          {/* StatCatalog is async and fetches the Augur API.
              Wrap in Suspense keyed on instrument so switching instruments
              replays the skeleton while new data loads. */}
          <Suspense key={instrument} fallback={<StatGridSkeleton />}>
            <StatCatalog instrument={instrument} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
