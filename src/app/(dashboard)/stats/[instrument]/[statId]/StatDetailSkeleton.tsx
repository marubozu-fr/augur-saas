// Shimmer skeleton for the stat detail DATA section (metadata strip,
// magnitudes, table). Rendered by <Suspense> fallback while StatDetail
// fetches the Augur API. The header (title/badge/definition) and the context
// zone / data filter zone controls are no longer part of this boundary — see
// page.tsx — so they are intentionally not represented here.

import { MetadataStripSkeleton } from "@/components/stat-detail/MetadataStrip";

function SkeletonLine({ className }: { className?: string }) {
  return (
    <span
      className={[
        "block rounded-sm bg-surface-2 relative overflow-hidden shimmer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
      <SkeletonLine className="h-3 w-[30%]" />
      <SkeletonLine className="h-3 w-[20%] ml-auto" />
      <SkeletonLine className="h-3 w-[12%]" />
      <SkeletonLine className="h-3 w-[14%]" />
    </div>
  );
}

function SkeletonSummaryCard() {
  return (
    <article className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3">
        <SkeletonLine className="h-3 w-32" />
        <SkeletonLine className="h-5 w-14 rounded-full" />
      </div>
      <SkeletonLine className="h-8 w-24" />
      <SkeletonLine className="h-3 w-36" />
    </article>
  );
}

export function StatDetailSkeleton() {
  return (
    <div aria-hidden="true">
      {/* Metadata strip skeleton */}
      <MetadataStripSkeleton />

      {/* Section heading skeleton */}
      <SkeletonLine className="h-5 w-48 mb-4 mt-6" />

      {/* Summary cards grid skeleton */}
      <div className="grid grid-cols-2 min-[861px]:grid-cols-4 gap-4">
        <SkeletonSummaryCard />
        <SkeletonSummaryCard />
        <SkeletonSummaryCard />
        <SkeletonSummaryCard />
      </div>

      {/* Section heading skeleton */}
      <SkeletonLine className="h-5 w-40 mb-4 mt-6" />

      {/* Table skeleton */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </div>
  );
}
