import { createBrowserClient } from "@supabase/ssr";
import { isDemoMode } from "@/lib/demo-mode";

export function createClient() {
  // Defense in depth — see the equivalent guard in lib/supabase/server.ts.
  if (isDemoMode()) {
    throw new Error(
      "Supabase is disabled in demo mode (NEXT_PUBLIC_DEMO_MODE=true)",
    );
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
