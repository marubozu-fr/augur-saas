import { createNavigation } from "next-intl/navigation";
import { locales } from "./config";

// Basic (non-routing) navigation setup: gives marketing components a
// locale-aware `Link` / `usePathname` pair so internal links stay prefixed
// (`/en/pricing`, `/fr/pricing`, ...) without pulling in next-intl's full
// routing middleware — locale routing for this app is hand-rolled in
// src/proxy.ts / src/lib/supabase/middleware.ts. The `NEXT_LOCALE` cookie is
// managed explicitly by src/lib/i18n/actions.ts, so next-intl's own cookie
// sync is disabled here to keep a single source of truth.
export const { Link, usePathname, useRouter, redirect, permanentRedirect } =
  createNavigation({ locales, localeCookie: false });
