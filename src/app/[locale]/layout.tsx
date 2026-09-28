import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales, isLocale } from "@/i18n/config";
import { isDemoMode } from "@/lib/demo-mode";
import { getStatCatalog } from "@/services/augur";
import { getCatalogCoverage } from "@/lib/stat-context";

// Only the public marketing pages (docs/mockups: landing, pricing) live under
// this URL-prefixed `[locale]` segment — see src/proxy.ts /
// src/lib/supabase/middleware.ts for the hybrid routing that keeps private
// routes (dashboard/account/stats/auth) on the cookie-only locale instead.

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams(): { locale: string }[] {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "landing" });

  // Demo mode: no "18 years" claim (unverifiable/stale) — derive the covered
  // year range from the catalog instead, and describe the demo as such. Not
  // wrapped in try/catch: a failed catalog fetch is a real failure here too,
  // consistent with DemoBanner and the dashboard redirect (PR #132).
  let description = t("metaDescription");
  if (isDemoMode()) {
    const tDemo = await getTranslations({ locale, namespace: "demo" });
    const catalog = await getStatCatalog();
    const { startYear, endYear } = getCatalogCoverage(catalog);
    description = tDemo("landing.metaDescription", { startYear, endYear });
  }

  // Title/description default for the segment; per-page hreflang alternates are
  // set in each page's generateMetadata so every page advertises its own URLs.
  return {
    title: t("metaTitle"),
    description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  // Enables static rendering for this locale in Server Components rendered
  // below (getTranslations/getLocale would otherwise assume a dynamic request).
  setRequestLocale(locale);

  return <>{children}</>;
}
