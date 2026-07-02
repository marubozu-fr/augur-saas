// Metadata strip — data range, total sessions, period label. Period-aware:
// callers pass the dataRange/totalSamples already selected from the active
// TimeframeResult, so this component stays a pure presentational piece.
// Rendered inside the same Suspense boundary as the data sections (it
// depends on the period-filtered fetch), with MetadataStripSkeleton as its
// loading placeholder — see StatDetailSkeleton.

import type { PeriodPreset } from "@/lib/period";

const PERIOD_LABELS: Record<PeriodPreset, string> = {
  all: "All history",
  "1m": "Last 1 month",
  "3m": "Last 3 months",
  "6m": "Last 6 months",
  ytd: "Year to date",
  "1yr": "Last 1 year",
  "2yr": "Last 2 years",
  "3yr": "Last 3 years",
  "5yr": "Last 5 years",
  "10yr": "Last 10 years",
};

interface MetadataStripProps {
  dataRange: string[];
  totalSamples: number;
  /** Set when a custom start/end range is active (takes precedence over `period`). */
  isCustomRange: boolean;
  period: PeriodPreset;
}

export function MetadataStrip({
  dataRange,
  totalSamples,
  isCustomRange,
  period,
}: MetadataStripProps) {
  const [rangeStart, rangeEnd] = dataRange;
  const periodLabel = isCustomRange ? "Custom range" : PERIOD_LABELS[period];

  return (
    <div className="flex gap-7 flex-wrap p-4 px-5 mb-6 border border-border rounded-lg bg-card">
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
          {totalSamples.toLocaleString("en-US")}
        </div>
      </div>
      <div>
        <div className="text-xs tracking-wider uppercase text-subtle">
          Period
        </div>
        <div className="text-sm font-semibold text-foreground mt-0.5">
          {periodLabel}
        </div>
      </div>
    </div>
  );
}

export function MetadataStripSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex gap-7 flex-wrap p-4 px-5 mb-6 border border-border rounded-lg bg-card"
    >
      <div className="flex flex-col gap-1.5">
        <span className="block h-2.5 w-16 rounded-sm bg-surface-2 relative overflow-hidden shimmer" />
        <span className="block h-3.5 w-44 rounded-sm bg-surface-2 relative overflow-hidden shimmer" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="block h-2.5 w-20 rounded-sm bg-surface-2 relative overflow-hidden shimmer" />
        <span className="block h-3.5 w-16 rounded-sm bg-surface-2 relative overflow-hidden shimmer" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="block h-2.5 w-12 rounded-sm bg-surface-2 relative overflow-hidden shimmer" />
        <span className="block h-3.5 w-24 rounded-sm bg-surface-2 relative overflow-hidden shimmer" />
      </div>
    </div>
  );
}
