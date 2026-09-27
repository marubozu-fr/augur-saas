import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserTier } from "@/lib/subscription.server";
import { isDemoMode } from "@/lib/demo-mode";
import { Sidebar } from "./Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Demo mode has no Supabase — /dashboard and /stats are open to everyone
  // (see the middleware demo branch), so skip the auth check entirely.
  if (!isDemoMode()) {
    // Defense-in-depth auth check alongside middleware.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/sign-in");
    }
  }

  // Fetch tier for the sidebar badge — fail open so the shell always renders.
  // Next.js deduplicates the underlying getUser call with per-page fetches.
  let userTier: number | null = null;
  try {
    userTier = await getCurrentUserTier();
  } catch (err) {
    console.error("[DashboardLayout] getCurrentUserTier failed", err);
    userTier = null;
  }

  return (
    <div className="grid md:grid-cols-[248px_1fr] min-h-screen">
      <Sidebar userTier={userTier} />
      <div className="flex flex-col min-w-0">{children}</div>
    </div>
  );
}
