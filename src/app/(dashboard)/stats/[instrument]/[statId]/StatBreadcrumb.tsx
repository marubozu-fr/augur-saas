// Breadcrumb — Dashboard / {stat title}.
// The title now comes from the stat catalog (already fetched once in
// page.tsx), so this is a plain presentational component: no fetch, no
// Suspense boundary needed anymore.

import Link from "next/link";
import { useTranslations } from "next-intl";

interface StatBreadcrumbProps {
  // Resolved family title (falls back to the raw statId slug upstream when
  // the catalog doesn't know this family).
  title: string;
  // Canonical uppercase instrument code (e.g. "NQ"). Used to point the
  // "Dashboard" link back to the instrument-specific catalog.
  instrument: string;
}

export function StatBreadcrumb({ title, instrument }: StatBreadcrumbProps) {
  const t = useTranslations("statDetail");

  // Point back-links at the instrument-specific catalog, not the root /dashboard
  // (which would require an extra redirect hop through the selector screen).
  const dashboardHref = instrument
    ? "/dashboard/" + instrument.toLowerCase()
    : "/dashboard";

  return (
    <nav
      className="flex items-center gap-2 text-sm text-subtle mb-5"
      aria-label={t("breadcrumbAriaLabel")}
    >
      <Link
        href={dashboardHref}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        {t("dashboardLink")}
      </Link>
      <span aria-hidden="true" className="text-subtle">
        /
      </span>
      <span className="text-foreground font-semibold" aria-current="page">
        {title}
      </span>
    </nav>
  );
}
