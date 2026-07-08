import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales, isLocale } from "@/i18n/config";

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

  // Title/description default for the segment; per-page hreflang alternates are
  // set in each page's generateMetadata so every page advertises its own URLs.
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
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
