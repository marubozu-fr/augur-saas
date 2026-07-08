import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isLocale } from "@/i18n/config";

const LOCALE_COOKIE = "NEXT_LOCALE";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// Exchanges the auth code from email links (password reset, email confirmation,
// magic links) for a session. Without this handler those links would 404.
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);

      // If the user has a saved language preference, apply it immediately so
      // the post-login app renders in their chosen locale instead of falling
      // back to Accept-Language detection.
      const user = data.user;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("preferred_locale")
          .eq("id", user.id)
          .single();

        const preferredLocale = profile?.preferred_locale;
        if (typeof preferredLocale === "string" && isLocale(preferredLocale)) {
          response.cookies.set(LOCALE_COOKIE, preferredLocale, {
            path: "/",
            sameSite: "lax",
            maxAge: ONE_YEAR_SECONDS,
          });
        }
      }

      return response;
    }
  }

  return NextResponse.redirect(
    `${origin}/sign-in?error=${encodeURIComponent("Could not authenticate. The link may have expired.")}`,
  );
}
