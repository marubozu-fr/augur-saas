import { locales, defaultLocale } from "./config";

// Builds page-specific hreflang alternates for a marketing path (e.g. "" for
// the locale root, "/pricing"). Each page must advertise its own equivalents —
// pointing every page at the marketing root would defeat the URL-prefix scheme.
export function buildLanguageAlternates(path: string): Record<string, string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${siteUrl}/${locale}${path}`;
  }
  languages["x-default"] = `${siteUrl}/${defaultLocale}${path}`;
  return languages;
}
