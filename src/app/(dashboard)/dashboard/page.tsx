// /dashboard — no instrument in the path.
// Reads the user's stored default_instrument from profiles:
//   • Set & valid  →  redirect to /dashboard/{code}
//   • Missing/null →  render the instrument selector screen
//
// The selector writes the choice via setDefaultInstrument (server action) and
// redirects, so subsequent visits go straight to the instrument dashboard.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeInstrument,
  SUPPORTED_INSTRUMENTS,
  getInstrumentName,
} from "@/lib/instruments";
import { setDefaultInstrument } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense-in-depth: layout already guards this, but redirect here too.
  if (!user) {
    redirect("/sign-in");
  }

  // Read the stored default instrument for this user.
  const { data: profile } = await supabase
    .from("profiles")
    .select("default_instrument")
    .eq("id", user.id)
    .single();

  const raw = profile?.default_instrument;
  const defaultInstrument =
    typeof raw === "string" ? normalizeInstrument(raw) : null;

  if (defaultInstrument) {
    redirect("/dashboard/" + defaultInstrument.toLowerCase());
  }

  // No default set — present the two-card selector screen.
  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Choose your instrument
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Select the futures instrument you want to track. You can switch at
            any time from the dashboard.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {SUPPORTED_INSTRUMENTS.map((code) => (
            <form key={code} action={setDefaultInstrument}>
              <input type="hidden" name="instrument" value={code} />
              <button
                type="submit"
                className="group w-full flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-6 text-left hover:border-border-strong hover:bg-surface-2 transition-all duration-[180ms] cursor-pointer"
              >
                <span className="font-mono text-2xl font-bold text-foreground">
                  {code}
                </span>
                <span className="text-sm text-muted-foreground">
                  {getInstrumentName(code)}
                </span>
                <span className="mt-2 inline-flex items-center justify-center h-8 px-4 rounded-md bg-brand text-xs font-semibold text-on-brand group-hover:bg-brand-hover transition-colors">
                  Select
                </span>
              </button>
            </form>
          ))}
        </div>
      </div>
    </main>
  );
}
