// Discrete "Advanced" toggle for a ConditionCard: collapsed by default, opens
// to reveal the edge/baseline/N caption, the metadata strip, and the full
// probability table for the condition's two rows. Native <details>/<summary>
// (server-component friendly, no JS needed) — reuses the same
// details[open] > summary .accordion-chev rotation rule from globals.css that
// SliceAccordion already relies on, so the chevron behaviour stays consistent
// across the page.

import type { StatResultRow } from "@/types/stats";
import type { PeriodPreset } from "@/lib/period";
import type { LabelResolver } from "./helpers";
import {
  computeEdge,
  edgeDirection,
  fmtEdgePts,
  fmtPct1,
  fmtNum,
} from "./helpers";
import { MetadataStrip } from "@/components/stat-detail/MetadataStrip";
import { ProbabilityTable } from "./ProbabilityTable";
import type { TableRow } from "./ProbabilityTable";

interface AdvancedPanelProps {
  /** The condition's "up" (above-baseline) outcome row — drives the caption. */
  upRow: StatResultRow;
  rows: TableRow[];
  resolver: LabelResolver;
  dataRange: string[];
  totalSamples: number;
  isCustomRange: boolean;
  period: PeriodPreset;
}

export function AdvancedPanel({
  upRow,
  rows,
  resolver,
  dataRange,
  totalSamples,
  isCustomRange,
  period,
}: AdvancedPanelProps) {
  const edge = computeEdge(upRow);
  const dir = edgeDirection(edge);
  const edgeClass =
    dir === "up" ? "text-up" : dir === "down" ? "text-down" : "text-neutral";

  return (
    <details className="mt-4 pt-4 border-t border-border">
      <summary className="inline-flex items-center gap-2 cursor-pointer list-none text-xs font-semibold tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors [&::-webkit-details-marker]:hidden">
        <svg
          className="accordion-chev flex-shrink-0 text-subtle transition-transform"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
        Advanced
      </summary>

      <div className="pt-4">
        <p className="text-xs text-subtle leading-snug mb-4">
          {resolver.outcome(upRow.outcome)}{" "}
          <strong className={`font-mono tabular-nums ${edgeClass}`}>
            {fmtEdgePts(edge)}
          </strong>{" "}
          vs{" "}
          <strong className="font-mono tabular-nums">
            {fmtPct1(upRow.baselineProb)}
          </strong>{" "}
          baseline · N{" "}
          <strong className="font-mono tabular-nums">
            {fmtNum(upRow.total)}
          </strong>
        </p>

        <MetadataStrip
          dataRange={dataRange}
          totalSamples={totalSamples}
          isCustomRange={isCustomRange}
          period={period}
        />

        <div className="border border-border rounded-xl bg-card overflow-x-auto">
          <ProbabilityTable rows={rows} resolver={resolver} />
        </div>
      </div>
    </details>
  );
}
