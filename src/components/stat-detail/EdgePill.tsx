import type { StatResultRow } from "@/types/stats";
import { computeEdge, edgeDirection, fmtEdgePts } from "@/lib/stat-format";

interface EdgePillProps {
  row: StatResultRow;
}

export function EdgePill({ row }: EdgePillProps) {
  const edge = computeEdge(row);
  const dir = edgeDirection(edge);

  const pillClass =
    dir === "up"
      ? "bg-up-soft text-up"
      : dir === "down"
        ? "bg-down-soft text-down"
        : "bg-surface-2 text-neutral";

  const chevron =
    dir === "up" ? (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 15l7-7 7 7" />
      </svg>
    ) : dir === "down" ? (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 9l7 7 7-7" />
      </svg>
    ) : null;

  return (
    <span
      className={[
        "inline-flex items-center gap-1 font-mono tabular-nums text-xs font-semibold px-2 py-1 rounded-full",
        pillClass,
      ].join(" ")}
    >
      {chevron}
      {fmtEdgePts(edge)}
    </span>
  );
}
