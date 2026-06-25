// Shimmer skeleton for the plan + billing cards while Stripe data loads.
// Rendered by <Suspense> fallback in account/page.tsx.
// Matches the loading skeleton in docs/mockups/account.html.

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

function SkeletonPlanCard() {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      {/* Header row: title + badge */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <SkeletonLine className="h-4 w-36" />
        <SkeletonLine className="h-5 w-16 rounded-full" />
      </div>

      {/* Plan name + price headline */}
      <SkeletonLine className="h-7 w-48" />

      {/* Detail list */}
      <div className="grid grid-cols-[max-content_1fr] gap-y-3 gap-x-5 mt-5 pt-5 border-t border-border">
        <SkeletonLine className="h-3 w-24" />
        <SkeletonLine className="h-3 w-40 justify-self-end" />
        <SkeletonLine className="h-3 w-20" />
        <SkeletonLine className="h-3 w-28 justify-self-end" />
        <SkeletonLine className="h-3 w-22" />
        <SkeletonLine className="h-3 w-24 justify-self-end" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border">
        <SkeletonLine className="h-10 w-36 rounded-md" />
      </div>
    </section>
  );
}

function SkeletonBillingCard() {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      {/* Header row: title */}
      <div className="mb-5">
        <SkeletonLine className="h-4 w-32" />
      </div>

      {/* Detail list */}
      <div className="grid grid-cols-[max-content_1fr] gap-y-3 gap-x-5">
        <SkeletonLine className="h-3 w-24" />
        <SkeletonLine className="h-3 w-36 justify-self-end" />
        <SkeletonLine className="h-3 w-28" />
        <SkeletonLine className="h-3 w-32 justify-self-end" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border">
        <SkeletonLine className="h-10 w-44 rounded-md" />
      </div>
    </section>
  );
}

export function AccountSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      <SkeletonPlanCard />
      <SkeletonBillingCard />
    </div>
  );
}
