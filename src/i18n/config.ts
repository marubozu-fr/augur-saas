// Single source of truth for supported locales. Reused by the middleware,
// the request config, generateStaticParams, and any locale validation.

export const locales = ["en", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Request header the middleware uses to forward the locale it resolved (URL
// prefix or cookie/Accept-Language fallback) to the single shared root
// layout, which renders before `[locale]/layout.tsx` calls
// `setRequestLocale()`. See src/i18n/request.ts and src/lib/supabase/middleware.ts.
export const LOCALE_HEADER = "x-augur-locale";
