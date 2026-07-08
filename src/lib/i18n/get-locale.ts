import "server-only";

// Thin wrapper around next-intl's getLocale() that narrows the return type to
// this app's own Locale union. next-intl types Locale as a plain `string`
// unless the app opts into global module augmentation, which this repo does
// not do — so every call site would otherwise need its own isLocale() guard.

import { getLocale } from "next-intl/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

export async function getActiveLocale(): Promise<Locale> {
  const locale = await getLocale();
  return isLocale(locale) ? locale : defaultLocale;
}
