// Shimmer skeleton for the stat detail content area.
// Rendered by <Suspense> fallback while StatDetail fetches the Augur API.

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
      {/* Header skeleton */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-3">
          <SkeletonLine className="h-7 w-64" />
          <SkeletonLine className="h-5 w-14 rounded-full" />
        </div>
        <SkeletonLine className="h-3 w-full max-w-xl" />
        <SkeletonLine className="h-3 w-[80%] max-w-md mt-2" />
      </div>

      {/* Controls bar skeleton */}
      <div className="flex items-center gap-5 flex-wrap p-4 px-5 mb-5 border border-border rounded-xl bg-card">
        <div className="flex flex-col gap-2">
          <SkeletonLine className="h-2.5 w-16" />
          <SkeletonLine className="h-9 w-32 rounded-md" />
        </div>
        <div className="w-px self-stretch bg-border" />
        <div className="flex flex-col gap-2">
          <SkeletonLine className="h-2.5 w-16" />
          <SkeletonLine className="h-7 w-24 rounded-md" />
        </div>
        <div className="flex gap-6 ml-auto">
          <div className="flex flex-col gap-1">
            <SkeletonLine className="h-2.5 w-16" />
            <SkeletonLine className="h-3.5 w-32" />
          </div>
          <div className="flex flex-col gap-1">
            <SkeletonLine className="h-2.5 w-16" />
            <SkeletonLine className="h-3.5 w-16" />
          </div>
        </div>
      </div>

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
