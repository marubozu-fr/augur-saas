"use server";

// Sets the NEXT_LOCALE cookie only — no DB write. Used by the public language
// switcher so a locale choice made on a marketing page also applies once the
// visitor reaches the cookie-driven private app (dashboard/account/stats/auth).
// Persisting a signed-in user's preference to their profile is a separate,
// explicit action: updateLocalePreference in (dashboard)/account/actions.ts.

import { cookies } from "next/headers";
import type { Locale } from "@/i18n/config";

const LOCALE_COOKIE = "NEXT_LOCALE";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setLocaleCookie(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: ONE_YEAR_SECONDS,
  });
}
