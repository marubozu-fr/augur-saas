// Async Server Component: fetches stat title for the breadcrumb.
// The getStatDetail call is deduped by Next.js within the same render pass,
// so this adds no extra network request alongside StatDetail.

import Link from "next/link";
import { getStatDetail } from "@/services/augur";

interface StatBreadcrumbProps {
  statId: string;
  // Canonical uppercase instrument code (e.g. "NQ"). Used to point the
  // "Dashboard" / "Catalog" links back to the instrument-specific catalog.
  instrument: string;
}

// Static leading segments shared by the live breadcrumb and its skeleton.
// `dashboardHref` defaults to /dashboard so the skeleton stays generic.
function BreadcrumbBase({
  children,
  ariaHidden,
  dashboardHref = "/dashboard",
}: {
  children: React.ReactNode;
  ariaHidden?: boolean;
  dashboardHref?: string;
}) {
  return (
    <nav
      className="flex items-center gap-2 text-sm text-subtle mb-5"
      aria-label="Breadcrumb"
      aria-hidden={ariaHidden}
    >
      <Link
        href={dashboardHref}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Dashboard
      </Link>
      <span aria-hidden="true" className="text-subtle">/</span>
      <Link
        href={dashboardHref}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Catalog
      </Link>
      <span aria-hidden="true" className="text-subtle">/</span>
      {children}
    </nav>
  );
}

export async function StatBreadcrumb({ statId, instrument }: StatBreadcrumbProps) {
  let title: string = statId;

  try {
    const result = await getStatDetail(statId);
    title = result.title.en;
  } catch (err) {
    console.error("[StatBreadcrumb] getStatDetail failed for", statId, err);
    // On any fetch failure, fall back to the raw slug.
    // StatDetail handles the real error/404 UI independently.
  }

  // Point back-links at the instrument-specific catalog, not the root /dashboard
  // (which would require an extra redirect hop through the selector screen).
  const dashboardHref = "/dashboard/" + instrument.toLowerCase();

  return (
    <BreadcrumbBase dashboardHref={dashboardHref}>
      <span className="text-foreground font-semibold" aria-current="page">
        {title}
      </span>
    </BreadcrumbBase>
  );
}

export function StatBreadcrumbSkeleton() {
  return (
    <BreadcrumbBase ariaHidden>
      {/* Shimmer placeholder — matches the shimmer pattern in StatDetailSkeleton */}
      <span className="inline-block h-3 w-40 rounded-sm bg-surface-2 relative overflow-hidden shimmer" />
    </BreadcrumbBase>
  );
}
