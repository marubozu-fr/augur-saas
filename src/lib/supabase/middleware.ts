import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { selectActiveSubscription } from "@/lib/subscription";

// Paths that require a valid session. /account is intentionally included so
// unauthenticated users are sent to sign-in, but it is NOT subscription-gated
// (authenticated users without a subscription must reach billing).
const PROTECTED_PREFIXES = ["/dashboard", "/account", "/stats"];

// Paths that additionally require an active subscription. /account is excluded
// so users can manage or create their subscription from the billing page.
const SUBSCRIPTION_GATED_PREFIXES = ["/dashboard", "/stats"];

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

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
            response.cookies.set(name, value, options);
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
    return NextResponse.redirect(signInUrl);
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
        return NextResponse.redirect(pricingUrl);
      }
    } catch {
      // Transient DB/RLS error. The user is already authenticated, so fail open
      // and let the page render rather than bouncing a paying user to /pricing.
    }
  }

  return response;
}
