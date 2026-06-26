// Async Server Component: fetches stat title for the breadcrumb.
// The getStatDetail call is deduped by Next.js within the same render pass,
// so this adds no extra network request alongside StatDetail.

import Link from "next/link";
import { getStatDetail } from "@/services/augur";

interface StatBreadcrumbProps {
  statId: string;
}

// Static leading segments (Dashboard / Catalog / …) shared by the live
// breadcrumb and its skeleton. The final segment is supplied via children.
function BreadcrumbBase({
  children,
  ariaHidden,
}: {
  children: React.ReactNode;
  ariaHidden?: boolean;
}) {
  return (
    <nav
      className="flex items-center gap-2 text-sm text-subtle mb-5"
      aria-label="Breadcrumb"
      aria-hidden={ariaHidden}
    >
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Dashboard
      </Link>
      <span aria-hidden="true" className="text-subtle">/</span>
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Catalog
      </Link>
      <span aria-hidden="true" className="text-subtle">/</span>
      {children}
    </nav>
  );
}

export async function StatBreadcrumb({ statId }: StatBreadcrumbProps) {
  let title: string = statId;

  try {
    const result = await getStatDetail(statId);
    title = result.title.en;
  } catch (err) {
    console.error("[StatBreadcrumb] getStatDetail failed for", statId, err);
    // On any fetch failure, fall back to the raw slug.
    // StatDetail handles the real error/404 UI independently.
  }

  return (
    <BreadcrumbBase>
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
