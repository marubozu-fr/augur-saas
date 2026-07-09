import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, LOCALE_HEADER, type Locale } from "./config";

const LOCALE_COOKIE = "NEXT_LOCALE";

// Picks the first locale the browser's Accept-Language header advertises that
// we actually support. Falls back to null when nothing matches.
function pickFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const requested = header
    .split(",")
    .map((part) => part.split(";")[0]?.trim().slice(0, 2).toLowerCase());

  for (const candidate of requested) {
    if (candidate && isLocale(candidate)) {
      return candidate;
    }
  }
  return null;
}

// Hybrid locale resolution, shared by every route in the app (marketing and
// private alike) since there is a single root layout:
//   (a) the `LOCALE_HEADER` set by the middleware (src/lib/supabase/middleware.ts),
//       which resolves the URL segment on marketing routes and this same
//       cookie/Accept-Language chain everywhere else. This is authoritative
//       because the root layout renders before `[locale]/layout.tsx` calls
//       `setRequestLocale()`, so `requestLocale` below is empty on first render.
//   (b) the `[locale]` URL segment (marketing routes only) — `requestLocale`
//   (c) the `NEXT_LOCALE` cookie (private routes, or a marketing return visit)
//   (d) the browser's Accept-Language header
//   (e) the app default ("en")
export default getRequestConfig(async ({ requestLocale }) => {
  const headerStore = await headers();
  const forwardedLocale = headerStore.get(LOCALE_HEADER);
  if (forwardedLocale && isLocale(forwardedLocale)) {
    return {
      locale: forwardedLocale,
      messages: (await import(`../../messages/${forwardedLocale}.json`))
        .default,
    };
  }

  const urlLocale = await requestLocale;
  if (urlLocale && isLocale(urlLocale)) {
    return {
      locale: urlLocale,
      messages: (await import(`../../messages/${urlLocale}.json`)).default,
    };
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return {
      locale: cookieLocale,
      messages: (await import(`../../messages/${cookieLocale}.json`)).default,
    };
  }

  const acceptLanguageLocale = pickFromAcceptLanguage(
    headerStore.get("accept-language"),
  );
  const locale = acceptLanguageLocale ?? defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
