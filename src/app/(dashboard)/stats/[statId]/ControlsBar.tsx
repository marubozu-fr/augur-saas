// Controls bar: instrument selector + timeframe selector + data range metadata.
// Server Component — the two selectors are client components (imported below).

import type { TimeframeResult } from "@/types/stats";
import { InstrumentSelector } from "@/app/(dashboard)/InstrumentSelector";
import { TimeframeSelector } from "./TimeframeSelector";

interface ControlsBarProps {
  instruments: string[];
  activeInstrument: string;
  timeframes: string[];
  activeTimeframe: string;
  tfResult: TimeframeResult;
}

export function ControlsBar({
  instruments,
  activeInstrument,
  timeframes,
  activeTimeframe,
  tfResult,
}: ControlsBarProps) {
  const [rangeStart, rangeEnd] = tfResult.dataRange;
  const totalN = tfResult.totalSamples.toLocaleString("en-US");

  return (
    <div className="flex items-center gap-5 flex-wrap p-4 px-5 mb-5 border border-border rounded-xl bg-card">
      {/* Instrument selector */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-wider uppercase text-subtle">
          Instrument
        </span>
        <InstrumentSelector
          instruments={instruments}
          activeInstrument={activeInstrument}
        />
      </div>

      <div className="w-px self-stretch bg-border" aria-hidden="true" />

      {/* Timeframe selector */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-wider uppercase text-subtle">
          Timeframe
        </span>
        <TimeframeSelector
          timeframes={timeframes}
          activeTimeframe={activeTimeframe}
        />
      </div>

      {/* Metadata: data range + total sessions */}
      <div className="flex gap-6 ml-auto flex-wrap">
        {rangeStart && rangeEnd && (
          <div>
            <div className="text-xs tracking-wider uppercase text-subtle">
              Data range
            </div>
            <div className="text-sm font-semibold font-mono tabular-nums text-foreground mt-0.5">
              {rangeStart} → {rangeEnd}
            </div>
          </div>
        )}
        <div>
          <div className="text-xs tracking-wider uppercase text-subtle">
            Total sessions
          </div>
          <div className="text-sm font-semibold font-mono tabular-nums text-foreground mt-0.5">
            {totalN}
          </div>
        </div>
      </div>
    </div>
  );
}
