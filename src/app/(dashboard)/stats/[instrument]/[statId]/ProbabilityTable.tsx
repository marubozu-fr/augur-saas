// Shared probability table used by both the main "Pattern frequency" section
// and the per-slice sub-tables inside SliceAccordion.
//
// When rows carry a `group` field the Group column is shown as the first column.
// The Condition and Outcome columns are always shown, resolved via the
// LabelResolver so human-readable labels appear instead of raw API codes.

import type { StatResultRow } from "@/types/stats";
import type { LabelResolver } from "./helpers";
import { computeEdge, edgeDirection, fmtPct, fmtNum } from "./helpers";
import { EdgePill } from "./EdgePill";

export interface TableRow {
  row: StatResultRow;
  /** Set to the group's human-readable label when rendering a slice sub-table. */
  group?: string;
}

interface ProbabilityTableProps {
  rows: TableRow[];
  resolver: LabelResolver;
  /** Background class for the thead cells — slices use bg-background, main uses bg-muted. */
  headBg?: string;
}

export function ProbabilityTable({
  rows,
  resolver,
  headBg = "bg-muted",
}: ProbabilityTableProps) {
  const showGroup = rows.some((r) => r.group !== undefined);

  const thClass = `text-left text-xs font-semibold tracking-wider uppercase text-subtle px-4 py-3 border-b border-border ${headBg} whitespace-nowrap`;
  const thNumClass = `text-right text-xs font-semibold tracking-wider uppercase text-subtle px-4 py-3 border-b border-border ${headBg} whitespace-nowrap`;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            {showGroup && (
              <th scope="col" className={thClass}>
                Group
              </th>
            )}
            <th scope="col" className={thClass}>
              Condition
            </th>
            <th scope="col" className={thClass}>
              Outcome
            </th>
            <th scope="col" className={thNumClass}>
              Probability
            </th>
            <th scope="col" className={thNumClass}>
              Baseline
            </th>
            <th scope="col" className={thNumClass}>
              N
            </th>
            <th scope="col" className={thNumClass}>
              Edge
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ row, group }, i) => {
            const edge = computeEdge(row);
            const dir = edgeDirection(edge);
            const probClass =
              dir === "up"
                ? "text-up"
                : dir === "down"
                  ? "text-down"
                  : "text-foreground";

            return (
              <tr
                key={i}
                className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors"
              >
                {showGroup && (
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {group}
                  </td>
                )}
                <td className="px-4 py-3 font-semibold text-foreground">
                  {resolver.condition(row.condition)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {resolver.outcome(row.outcome)}
                </td>
                <td
                  className={[
                    "px-4 py-3 text-right font-mono tabular-nums font-bold",
                    probClass,
                  ].join(" ")}
                >
                  {fmtPct(row.probability)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-subtle">
                  {fmtPct(row.baselineProb)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                  {fmtNum(row.total)}
                </td>
                <td className="px-4 py-3 text-right">
                  <EdgePill row={row} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
