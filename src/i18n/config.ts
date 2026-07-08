// Single source of truth for supported locales. Reused by the middleware,
// the request config, generateStaticParams, and any locale validation.

export const locales = ["en", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
