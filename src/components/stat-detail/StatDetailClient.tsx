// Top-level client wrapper for the stat detail page (issue #89). Owns
// timeframe/period/custom-range as client React state (the URL is now the
// clean path /stats/{instrument}/{statId} with NO query params). When that
// state changes, it calls the fetchStatSlice Server Action to refetch the
// data server-side (so AUGUR_API_KEY never reaches the browser) and renders
// the result via StatDetailContent. Instrument changes and stat-family
// changes navigate to a new path instead, since instrument is a path segment.
//
// `header` and the initial `children` (the server-rendered data section for
// the page's default slice) are Server Component output streamed in from
// page.tsx — passing them as props (rather than importing/rendering
// server-only modules here) keeps this client boundary minimal.

"use client";

import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ContextZone } from "./ContextZone";
import { DataFilterZone } from "./DataFilterZone";
import {
  getFamilyTimeframes,
  getGlobalInstruments,
  isIsoDate,
} from "@/lib/stat-context";
import { fetchStatSlice } from "@/app/(dashboard)/stats/[instrument]/[statId]/actions";
import { StatDetailContent } from "@/app/(dashboard)/stats/[instrument]/[statId]/StatDetailContent";
import { StatDetailSkeleton } from "@/app/(dashboard)/stats/[instrument]/[statId]/StatDetailSkeleton";
import type { StatSliceResult } from "@/app/(dashboard)/stats/[instrument]/[statId]/load-stat-slice";
import type { PeriodPreset } from "@/lib/period";
import type { StatFamilyMeta } from "@/types/stats";
import type { Locale } from "@/i18n/config";

interface StatDetailClientProps {
  statId: string;
  catalog: StatFamilyMeta[];
  // Resolved, uppercase — from the path.
  activeInstrument: string;
  defaultTimeframe: string;
  // Active locale, resolved server-side in page.tsx — threaded down so the
  // client-side refetch path (fetchStatSlice → StatDetailContent) can pick
  // the right I18nString field on the freshly fetched stat data.
  locale: Locale;
  header: ReactNode;
  // Initial server-rendered data section, for the default slice.
  children: ReactNode;
}

export function StatDetailClient({
  statId,
  catalog,
  activeInstrument,
  defaultTimeframe,
  locale,
  header,
  children,
}: StatDetailClientProps) {
  const router = useRouter();

  const [timeframe, setTimeframe] = useState(defaultTimeframe);
  const [period, setPeriod] = useState<PeriodPreset>("all");
  const [customStart, setCustomStart] = useState<string | null>(null);
  const [customEnd, setCustomEnd] = useState<string | null>(null);
  const isCustomRange = isIsoDate(customStart) && isIsoDate(customEnd);
  const [slice, setSlice] = useState<StatSliceResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function refetch(
    nextTimeframe: string,
    nextPeriod: PeriodPreset,
    nextStart: string | null,
    nextEnd: string | null,
  ) {
    startTransition(async () => {
      const result = await fetchStatSlice({
        statId,
        instrument: activeInstrument,
        timeframe: nextTimeframe,
        period: nextPeriod,
        isCustomRange: Boolean(nextStart && nextEnd),
        start: nextStart,
        end: nextEnd,
      });
      setSlice(result);
    });
  }

  function handleTimeframeChange(nextTimeframe: string) {
    setTimeframe(nextTimeframe);
    refetch(
      nextTimeframe,
      period,
      isCustomRange ? customStart : null,
      isCustomRange ? customEnd : null,
    );
  }

  function handlePeriodChange(nextPeriod: PeriodPreset) {
    setPeriod(nextPeriod);
    setCustomStart(null);
    setCustomEnd(null);
    refetch(timeframe, nextPeriod, null, null);
  }

  function handleCustomRangeApply(start: string, end: string) {
    setCustomStart(start);
    setCustomEnd(end);
    refetch(timeframe, period, start, end);
  }

  function handleInstrumentChange(instrument: string) {
    router.push(`/stats/${instrument.toLowerCase()}/${statId}`, {
      scroll: false,
    });
  }

  function handleNavigateStat(newFamily: string) {
    router.push(`/stats/${activeInstrument.toLowerCase()}/${newFamily}`, {
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
        locale={locale}
        onInstrumentChange={handleInstrumentChange}
        onPeriodChange={handlePeriodChange}
        onCustomRangeApply={handleCustomRangeApply}
        onNavigateStat={handleNavigateStat}
      />

      {header}

      <DataFilterZone
        timeframes={getFamilyTimeframes(catalog, statId, activeInstrument)}
        activeTimeframe={timeframe}
        onTimeframeChange={handleTimeframeChange}
      />

      {isPending ? (
        <StatDetailSkeleton />
      ) : slice ? (
        <StatDetailContent result={slice} locale={locale} />
      ) : (
        children
      )}
    </>
  );
}
