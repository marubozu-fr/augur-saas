import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient(rememberSession: boolean = true) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (!rememberSession) {
                // Strip maxAge/expires so cookies clear on browser close (session cookies).
                const sessionOptions = Object.fromEntries(
                  Object.entries(options ?? {}).filter(
                    ([k]) => k !== "maxAge" && k !== "expires",
                  ),
                );
                cookieStore.set(name, value, sessionOptions);
              } else {
                cookieStore.set(name, value, options);
              }
            });
          } catch {
            // setAll called from a Server Component — cookies are read-only.
            // The middleware handles session refresh, so this is safe to ignore.
          }
        },
      },
    },
  );
}
