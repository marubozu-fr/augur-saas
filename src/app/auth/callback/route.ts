import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Exchanges the auth code from email links (password reset, email confirmation,
// magic links) for a session. Without this handler those links would 404.
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/sign-in?error=${encodeURIComponent("Could not authenticate. The link may have expired.")}`,
  );
}
