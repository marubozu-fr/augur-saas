import type { I18nString } from "@/types/stats";
import type { Locale } from "@/i18n/config";

// Selects the active-locale string out of an Augur API I18nString. Centralises
// what used to be a hardcoded `.en` access at every stat render site.
export function pickLocale(value: I18nString, locale: Locale): string {
  return value[locale];
}
