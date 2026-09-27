// Supabase admin client — uses the service-role key to bypass RLS.
// Use this ONLY in server-side contexts (webhook handlers, API routes).
// NEVER import from client components — SUPABASE_SERVICE_ROLE_KEY must not reach the browser.

import "server-only";

import { createClient } from "@supabase/supabase-js";
import { isDemoMode } from "@/lib/demo-mode";

export function createAdminClient() {
  // Defense in depth — see the equivalent guard in lib/supabase/server.ts.
  if (isDemoMode()) {
    throw new Error(
      "Supabase is disabled in demo mode (NEXT_PUBLIC_DEMO_MODE=true)",
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
  }
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  return createClient(url, serviceRoleKey);
}
