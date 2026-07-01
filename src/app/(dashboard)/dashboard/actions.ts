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
  // Safety net against empty/whitespace input — not an expected error path.
  if (!canonical) return;

  const { error } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, default_instrument: canonical },
      { onConflict: "id" },
    );

  if (error) {
    // Persisting the preference failed (e.g. RLS/permission). Do not redirect
    // into the instrument dashboard on a failed write — surface via logs and
    // let the selector screen render again on the next load.
    console.error("Failed to persist default_instrument:", error);
    return;
  }

  redirect("/dashboard/" + canonical.toLowerCase());
}
