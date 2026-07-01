import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { NO_PERSIST_COOKIE } from "@/lib/constants";
import { selectActiveSubscription } from "@/lib/subscription";

// Paths that require a valid session. /account is intentionally included so
// unauthenticated users are sent to sign-in, but it is NOT subscription-gated
// (authenticated users without a subscription must reach billing).
const PROTECTED_PREFIXES = ["/dashboard", "/account", "/stats"];

// Paths that additionally require an active subscription. /account is excluded
// so users can manage or create their subscription from the billing page.
const SUBSCRIPTION_GATED_PREFIXES = ["/dashboard", "/stats"];

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

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

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
          response = NextResponse.next({ request });
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
        return withPropagatedCookies(NextResponse.redirect(pricingUrl), response);
      }
    } catch {
      // Transient DB/RLS error. The user is already authenticated, so fail open
      // and let the page render rather than bouncing a paying user to /pricing.
    }
  }

  return response;
}
