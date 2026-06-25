// Supabase admin client — uses the service-role key to bypass RLS.
// Use this ONLY in server-side contexts (webhook handlers, API routes).
// NEVER import from client components — SUPABASE_SERVICE_ROLE_KEY must not reach the browser.

import "server-only";

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
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
