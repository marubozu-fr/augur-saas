// /dashboard — no instrument in the path.
// Reads the user's stored default_instrument from profiles:
//   • Set & valid  →  redirect to /dashboard/{code}
//   • Missing/null →  render the instrument selector screen
//
// The selector writes the choice via setDefaultInstrument (server action) and
// redirects, so subsequent visits go straight to the instrument dashboard.

import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeInstrument } from "@/lib/instruments";
import { getStatCatalog, AugurApiError } from "@/services/augur";
import {
  getGlobalInstruments,
  pickPrimaryInstrument,
} from "@/lib/stat-context";
import { isDemoMode } from "@/lib/demo-mode";
import { setDefaultInstrument } from "./actions";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard.selectInstrument");

  // Demo mode has no Supabase, so there is no per-user stored preference to
  // check — skip straight to the catalog fetch below.
  if (!isDemoMode()) {
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
  }

  // No default set (live mode) — fetch the catalog to derive the instrument
  // list. Demo mode goes through the exact same fetch + error handling: the
  // only difference is what happens afterwards (see below).
  let instruments: string[];
  let primaryInstrument = "";
  let catalogError: string | null = null;

  try {
    const families = await getStatCatalog();
    instruments = getGlobalInstruments(families);
    primaryInstrument = pickPrimaryInstrument(families);
  } catch (err) {
    const message =
      err instanceof AugurApiError ? err.message : t("loadFailed");
    catalogError = message;
    instruments = [];
  }

  // Demo mode has no per-user preference to set, so it skips the selector
  // grid entirely and always goes straight to the instrument that covers the
  // most stat families (see pickPrimaryInstrument) — not just the
  // alphabetically first one. A catalog failure or an empty catalog falls
  // through to the same rendering as live mode below, instead of a silently
  // degraded state.
  if (isDemoMode() && !catalogError && primaryInstrument) {
    redirect("/dashboard/" + primaryInstrument.toLowerCase());
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
              {t("couldNotLoad")}
            </h2>
            <p className="text-sm text-muted-foreground max-w-[26rem]">
              {catalogError}
            </p>
            <p className="text-xs text-subtle">{t("refreshToTry")}</p>
          </div>
        ) : instruments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">
            {t("noInstrumentsAvailable")}
          </p>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("title")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("description")}
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
                      {t("select")}
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
