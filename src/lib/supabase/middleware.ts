import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { NO_PERSIST_COOKIE } from "@/lib/constants";
import { selectActiveSubscription } from "@/lib/subscription";
import {
  defaultLocale,
  isLocale,
  LOCALE_HEADER,
  type Locale,
} from "@/i18n/config";

// Paths that require a valid session. /account is intentionally included so
// unauthenticated users are sent to sign-in, but it is NOT subscription-gated
// (authenticated users without a subscription must reach billing).
const PROTECTED_PREFIXES = ["/dashboard", "/account", "/stats"];

// Paths that additionally require an active subscription. /account is excluded
// so users can manage or create their subscription from the billing page.
const SUBSCRIPTION_GATED_PREFIXES = ["/dashboard", "/stats"];

// Public marketing pages — the only routes that live under the URL-prefixed
// `[locale]` segment (src/app/[locale]/(marketing)/...). Every other route in
// this repo is a private, cookie-locale-driven route (dashboard/account/stats)
// or an auth/API route.
// Keep in sync with src/app/[locale]/(marketing)/ routes.
const MARKETING_PATHS = ["/", "/pricing"];

// Top-level path segments owned by a real (non-marketing) route. Used to tell
// a genuinely unknown/invalid locale-looking segment (e.g. "/de/pricing")
// apart from an existing private route (e.g. "/dashboard") when both reduce
// to a single first segment.
const KNOWN_APP_SEGMENTS = new Set([
  "sign-in",
  "sign-up",
  "forgot-password",
  "dashboard",
  "account",
  "stats",
  "auth",
  "api",
]);

const LOCALE_COOKIE = "NEXT_LOCALE";

// Redirects build a brand-new NextResponse, which does not carry the auth
// cookies accumulated on `response` (e.g. a token refreshed by getUser()).
// Copy them over so a redirect never drops a freshly rotated refresh token.
function withPropagatedCookies(
  redirectResponse: NextResponse,
  response: NextResponse,
): NextResponse {
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

// Cookie → Accept-Language → default, mirroring src/i18n/request.ts.
function detectLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    for (const part of acceptLanguage.split(",")) {
      const candidate = part.split(";")[0]?.trim().slice(0, 2).toLowerCase();
      if (candidate && isLocale(candidate)) {
        return candidate;
      }
    }
  }

  return defaultLocale;
}

// Splits a pathname into its first segment and the remainder (normalised to
// at least "/"). Used to detect and strip a `[locale]` URL prefix.
function splitFirstSegment(pathname: string): {
  first: string | null;
  rest: string;
} {
  const match = pathname.match(/^\/([^/]+)(\/.*)?$/);
  if (!match) return { first: null, rest: pathname };
  const rest = match[2] && match[2] !== "" ? match[2] : "/";
  return { first: match[1], rest };
}

// Resolves the hybrid locale routing described in the (marketing)-only
// `[locale]` URL-prefix scheme: returns a redirect target when the request
// needs one, or null when the request should pass through unchanged (either
// because it's a valid prefixed marketing path, or a private/no-prefix path
// that the existing auth/subscription logic below handles as before).
function resolveLocaleRedirect(request: NextRequest): string | null {
  const { pathname } = request.nextUrl;

  // Marketing path with no locale prefix at all — add one.
  if (MARKETING_PATHS.includes(pathname)) {
    const locale = detectLocale(request);
    return `/${locale}${pathname === "/" ? "" : pathname}`;
  }

  const { first, rest } = splitFirstSegment(pathname);
  if (!first) return null;

  if (isLocale(first)) {
    // Valid prefix on a marketing path — pass through as-is.
    if (MARKETING_PATHS.includes(rest)) return null;
    // Locale prefixes are marketing-only — strip it from any other path.
    return rest;
  }

  // First segment isn't a known private route and the remainder is a
  // marketing path — treat it as a mistyped/unsupported locale prefix.
  if (!KNOWN_APP_SEGMENTS.has(first) && MARKETING_PATHS.includes(rest)) {
    return `/${defaultLocale}${rest === "/" ? "" : rest}`;
  }

  return null;
}

// Resolves the locale that will actually be rendered for this request: the
// URL-prefixed segment on marketing routes, falling back to the existing
// cookie → Accept-Language → default chain everywhere else. Forwarded to the
// app via LOCALE_HEADER so the shared root layout (which renders before
// `[locale]/layout.tsx` calls `setRequestLocale()`) resolves the same locale.
function resolveLocale(request: NextRequest): Locale {
  const { first } = splitFirstSegment(request.nextUrl.pathname);
  if (first && isLocale(first)) {
    return first;
  }
  return detectLocale(request);
}

// Builds a pass-through response carrying the resolved locale as a request
// header. Clones `request.headers` fresh each call, since the Supabase
// `setAll` callback mutates `request`'s cookies (and therefore its `cookie`
// header) between the initial response and this one.
function nextWithLocale(request: NextRequest, locale: Locale): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  const locale = resolveLocale(request);
  let response = nextWithLocale(request, locale);

  // When the user signed in with "Keep me signed in" unchecked, the sign-in
  // action sets this marker. Strip maxAge/expires on refresh so the auth cookies
  // stay session-scoped instead of being silently re-persisted here.
  const noPersist = request.cookies.get(NO_PERSIST_COOKIE)?.value === "1";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = nextWithLocale(request, locale);
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = noPersist
              ? Object.fromEntries(
                  Object.entries(options ?? {}).filter(
                    ([k]) => k !== "maxAge" && k !== "expires",
                  ),
                )
              : options;
            response.cookies.set(name, value, cookieOptions);
          });
        },
      },
    },
  );

  // Use getUser (not getSession) — validates the JWT with the Supabase server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Hybrid locale routing (marketing pages only — see resolveLocaleRedirect).
  // Runs before the protected/subscription gates below: every case handled
  // here ends in a redirect, so there is nothing left to gate on this request.
  const localeRedirectPathname = resolveLocaleRedirect(request);
  if (localeRedirectPathname !== null) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = localeRedirectPathname;
    return withPropagatedCookies(NextResponse.redirect(redirectUrl), response);
  }

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !user) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    return withPropagatedCookies(NextResponse.redirect(signInUrl), response);
  }

  // Subscription gate: only runs for authenticated users on gated prefixes.
  // Skips the DB call entirely for /account and all non-gated paths.
  const isSubscriptionGated = SUBSCRIPTION_GATED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (user && isSubscriptionGated) {
    try {
      const subscription = await selectActiveSubscription(supabase, user.id);
      if (!subscription) {
        const pricingUrl = request.nextUrl.clone();
        pricingUrl.pathname = "/pricing";
        return withPropagatedCookies(
          NextResponse.redirect(pricingUrl),
          response,
        );
      }
    } catch {
      // Transient DB/RLS error. The user is already authenticated, so fail open
      // and let the page render rather than bouncing a paying user to /pricing.
    }
  }

  return response;
}
