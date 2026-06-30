// /dashboard — no instrument in the path.
// Reads the user's stored default_instrument from profiles:
//   • Set & valid  →  redirect to /dashboard/{code}
//   • Missing/null →  render the instrument selector screen
//
// The selector writes the choice via setDefaultInstrument (server action) and
// redirects, so subsequent visits go straight to the instrument dashboard.

import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { normalizeInstrument } from "@/lib/instruments";
import { getStatCatalog, AugurApiError } from "@/services/augur";
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

  // No default set — fetch the catalog to derive the instrument list.
  let instruments: string[];
  let catalogError: string | null = null;

  try {
    const families = await getStatCatalog();
    const instrumentSet = new Set<string>();
    for (const f of families) {
      for (const tf of f.timeframes) {
        instrumentSet.add(tf.instrument);
      }
    }
    instruments = Array.from(instrumentSet).sort();
  } catch (err) {
    const message =
      err instanceof AugurApiError
        ? err.message
        : "Failed to load the instrument list. Please try again later.";
    catalogError = message;
    instruments = [];
  }

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
      <div className="w-full max-w-lg">
        {catalogError ? (
          <div className="flex flex-col items-center gap-4 py-16 px-5 text-center rounded-xl border border-dashed border-border-strong bg-muted">
            <span className="inline-grid place-items-center w-14 h-14 rounded-full bg-surface-2 text-muted-foreground">
              <AlertTriangle size={26} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">
              Could not load instruments
            </h2>
            <p className="text-sm text-muted-foreground max-w-[26rem]">
              {catalogError}
            </p>
            <p className="text-xs text-subtle">Refresh the page to try again.</p>
          </div>
        ) : instruments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">
            No instruments available.
          </p>
        ) : (
          <>
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
              {instruments.map((code) => (
                <form key={code} action={setDefaultInstrument}>
                  <input type="hidden" name="instrument" value={code} />
                  <button
                    type="submit"
                    className="group w-full flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-6 text-left hover:border-border-strong hover:bg-surface-2 transition-all duration-[180ms] cursor-pointer"
                  >
                    <span className="font-mono text-2xl font-bold text-foreground">
                      {code}
                    </span>
                    <span className="mt-2 inline-flex items-center justify-center h-8 px-4 rounded-md bg-brand text-xs font-semibold text-on-brand group-hover:bg-brand-hover transition-colors">
                      Select
                    </span>
                  </button>
                </form>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
