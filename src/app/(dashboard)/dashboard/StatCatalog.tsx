// Async server component: fetches the stat catalog and renders the catalog
// content area (page head, instrument selector, grid / empty / error states).

import { AlertTriangle, SearchX } from "lucide-react";
import { getStatCatalog, AugurApiError } from "@/services/augur";
import { getCurrentUserTier } from "@/lib/subscription.server";
import { canAccessStat } from "@/lib/subscription";
import { getStatTier } from "@/lib/stat-tiers";
import { InstrumentSelector } from "@/app/(dashboard)/InstrumentSelector";
import { StatCard } from "./StatCard";
import type { TimeframeMeta } from "@/types/stats";

interface StatCatalogProps {
  instrument: string;
}

export async function StatCatalog({ instrument }: StatCatalogProps) {
  // -------------------------------------------------------------------------
  // Fetch catalog + tier (both inside try/catch — errors render inline)
  // -------------------------------------------------------------------------
  let families: Awaited<ReturnType<typeof getStatCatalog>>;
  let userTier: number | null;

  try {
    [families, userTier] = await Promise.all([
      getStatCatalog(),
      getCurrentUserTier(),
    ]);
  } catch (err) {
    console.error("[StatCatalog] fetch failed", { instrument }, err);
    const message =
      err instanceof AugurApiError
        ? err.message
        : "Failed to load the stat catalog. Please try again later.";

    return (
      <div className="flex flex-col items-center gap-4 py-16 px-5 text-center rounded-xl border border-dashed border-border-strong bg-muted">
        <span className="inline-grid place-items-center w-14 h-14 rounded-full bg-surface-2 text-muted-foreground">
          <AlertTriangle size={26} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">
          Could not load stats
        </h2>
        <p className="text-sm text-muted-foreground max-w-[26rem]">{message}</p>
        <p className="text-xs text-subtle">
          Refresh the page to try again.
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Derive instrument list: all instruments returned by the API, sorted.
  // -------------------------------------------------------------------------
  const instrumentSet = new Set<string>();
  for (const f of families) {
    for (const tf of f.timeframes) {
      instrumentSet.add(tf.instrument);
    }
  }
  const instruments = Array.from(instrumentSet).sort();

  // instrument is already validated upstream (normalizeInstrument in the page)
  const activeInstrument = instrument;

  // -------------------------------------------------------------------------
  // Filter families to those that have a timeframe for the active instrument
  // -------------------------------------------------------------------------
  interface FamilyEntry {
    family: (typeof families)[number];
    // Every timeframe of the active instrument — the card aggregates them.
    timeframes: TimeframeMeta[];
    tier: number;
    locked: boolean;
  }

  const filtered: FamilyEntry[] = [];
  for (const family of families) {
    const tfs = family.timeframes.filter(
      (t) => t.instrument === activeInstrument,
    );
    if (tfs.length === 0) continue;
    const statTier = getStatTier(family.family);
    filtered.push({
      family,
      timeframes: tfs,
      tier: statTier,
      locked: !canAccessStat(userTier, statTier),
    });
  }

  return (
    <>
      {/* Page head */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Good morning
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-mono tabular-nums">{filtered.length}</span>{" "}
            stat {filtered.length === 1 ? "family" : "families"} ·{" "}
            <span className="font-mono tabular-nums">{activeInstrument}</span>
          </p>
        </div>

        {/* Instrument selector — navigates to /dashboard/{instrument} path */}
        {instruments.length > 1 && (
          <InstrumentSelector
            instruments={instruments}
            activeInstrument={activeInstrument}
            hrefTemplate="/dashboard/{instrument}"
          />
        )}
      </div>

      {/* Stat grid */}
      {filtered.length === 0 ? (
        <div className="grid grid-cols-1">
          <EmptyState instrument={activeInstrument} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 min-[861px]:grid-cols-3 gap-5">
          {filtered.map(({ family, timeframes, tier, locked }) => (
            <StatCard
              key={family.family}
              family={family}
              timeframes={timeframes}
              tier={tier}
              locked={locked}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ instrument }: { instrument: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-16 px-5 border border-dashed border-border-strong rounded-xl bg-muted">
      <span className="inline-grid place-items-center w-14 h-14 rounded-full bg-surface-2 text-subtle">
        <SearchX size={26} aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold text-foreground">
        No stat families for {instrument}
      </h2>
      <p className="text-sm text-muted-foreground max-w-[26rem]">
        There are no stat families available for{" "}
        <span className="font-mono">{instrument}</span> at this time. Try
        selecting a different instrument.
      </p>
    </div>
  );
}
