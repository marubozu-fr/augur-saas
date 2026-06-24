// Shimmer skeleton grid shown via <Suspense> while StatCatalog is loading.
// Shimmer animation is defined in src/app/globals.css (.shimmer class).
// Matches the loading state in docs/mockups/dashboard.html.

function SkeletonCard() {
  return (
    <article className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      {/* Top row: icon skeleton + badge skeleton */}
      <div className="flex items-start justify-between gap-3">
        <span className="w-10 h-10 rounded-md bg-surface-2 relative overflow-hidden shimmer flex-shrink-0" />
        <span className="w-14 h-5 rounded-full bg-surface-2 relative overflow-hidden shimmer" />
      </div>

      {/* Title + instrument */}
      <div className="flex flex-col gap-2">
        <span className="h-4 w-[70%] rounded-sm bg-surface-2 relative overflow-hidden shimmer" />
        <span className="h-3 w-[30%] rounded-sm bg-surface-2 relative overflow-hidden shimmer" />
      </div>

      {/* Description lines */}
      <div className="flex flex-col gap-2">
        <span className="h-3 w-full rounded-sm bg-surface-2 relative overflow-hidden shimmer" />
        <span className="h-3 w-[85%] rounded-sm bg-surface-2 relative overflow-hidden shimmer" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
        <span className="h-3 w-20 rounded-sm bg-surface-2 relative overflow-hidden shimmer" />
        <span className="h-3 w-16 rounded-sm bg-surface-2 relative overflow-hidden shimmer" />
      </div>
    </article>
  );
}

export function StatGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 min-[861px]:grid-cols-3 gap-5"
      aria-hidden="true"
    >
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
