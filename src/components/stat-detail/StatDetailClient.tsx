// Top-level client wrapper for the stat detail page (issue #87). Owns URL
// state via useRouter()/usePathname()/useSearchParams() and renders the two
// interactive filter surfaces (ContextZone, DataFilterZone). `header` and
// `children` are Server Component output streamed in from page.tsx — passing
// them as props (rather than importing/rendering server-only modules here)
// keeps this client boundary minimal while preserving server rendering for
// the data-dependent parts.
//
// ContextZone/DataFilterZone derive their "active" values directly from
// useSearchParams(), which updates synchronously on navigation — this is
// what keeps them visually responsive even while the data section (wrapped
// in its own <Suspense> by page.tsx) is still streaming in.

"use client";

import type { ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ContextZone } from "./ContextZone";
import { DataFilterZone } from "./DataFilterZone";
import {
  getFamilyTimeframes,
  getGlobalInstruments,
  isIsoDate,
  isPeriodPreset,
  resolveActiveInstrument,
  resolveActiveTimeframe,
} from "@/lib/stat-context";
import type { PeriodPreset } from "@/lib/period";
import type { StatFamilyMeta } from "@/types/stats";

interface StatDetailClientProps {
  statId: string;
  catalog: StatFamilyMeta[];
  header: ReactNode;
  children: ReactNode;
}

export function StatDetailClient({
  statId,
  catalog,
  header,
  children,
}: StatDetailClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeInstrument = resolveActiveInstrument(
    catalog,
    statId,
    searchParams.get("instrument"),
  );
  const activeTimeframe = resolveActiveTimeframe(
    catalog,
    statId,
    activeInstrument,
    searchParams.get("timeframe"),
  );
  const rawPeriod = searchParams.get("period");
  const period: PeriodPreset = isPeriodPreset(rawPeriod) ? rawPeriod : "all";
  const customStart = searchParams.get("start");
  const customEnd = searchParams.get("end");
  const isCustomRange = isIsoDate(customStart) && isIsoDate(customEnd);

  function updateParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function navigateToStat(newFamily: string) {
    // Preserve the current query string (instrument, period, start/end) — but
    // drop a timeframe the new family doesn't offer, so the URL doesn't carry a
    // stale ?timeframe=. The server resolves the default either way; this just
    // keeps the URL clean and honest about what's actually selected.
    const params = new URLSearchParams(searchParams.toString());
    const currentTimeframe = params.get("timeframe");
    if (currentTimeframe) {
      const newInstrument = resolveActiveInstrument(
        catalog,
        newFamily,
        params.get("instrument"),
      );
      const available = getFamilyTimeframes(catalog, newFamily, newInstrument);
      if (!available.includes(currentTimeframe)) {
        params.delete("timeframe");
      }
    }
    const qs = params.toString();
    router.push(qs ? `/stats/${newFamily}?${qs}` : `/stats/${newFamily}`, {
      scroll: false,
    });
  }

  return (
    <>
      <ContextZone
        statId={statId}
        catalog={catalog}
        instruments={getGlobalInstruments(catalog)}
        activeInstrument={activeInstrument}
        period={period}
        isCustomRange={isCustomRange}
        customStart={customStart}
        customEnd={customEnd}
        onInstrumentChange={(instrument) => updateParams({ instrument })}
        onPeriodChange={(preset) =>
          updateParams({ period: preset, start: null, end: null })
        }
        onCustomRangeApply={(start, end) =>
          updateParams({ start, end, period: null })
        }
        onNavigateStat={navigateToStat}
      />

      {header}

      <DataFilterZone
        timeframes={getFamilyTimeframes(catalog, statId, activeInstrument)}
        activeTimeframe={activeTimeframe}
        onTimeframeChange={(timeframe) => updateParams({ timeframe })}
      />

      {children}
    </>
  );
}
