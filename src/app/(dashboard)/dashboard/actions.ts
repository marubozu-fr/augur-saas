"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeInstrument } from "@/lib/instruments";

// ---------------------------------------------------------------------------
// Set default instrument — persists the user's preferred instrument to
// profiles.default_instrument, then redirects to /dashboard/{instrument}.
// Called by the instrument selector screen on /dashboard (no-instrument path).
// ---------------------------------------------------------------------------

export async function setDefaultInstrument(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const raw = formData.get("instrument");
  if (typeof raw !== "string") return;

  const canonical = normalizeInstrument(raw);
  // Silently ignore unknown instruments — the form only submits NQ / ES so
  // this guard is a safety net, not an expected error path.
  if (!canonical) return;

  await supabase
    .from("profiles")
    .update({ default_instrument: canonical })
    .eq("id", user.id);

  redirect("/dashboard/" + canonical.toLowerCase());
}
