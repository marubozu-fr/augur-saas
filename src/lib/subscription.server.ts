// Server-side subscription helpers.
// Import this only in Server Components and API routes — never from client components.
// Uses next/headers via @/lib/supabase/server, so it is server-only.

import "server-only";

import { createClient } from "@/lib/supabase/server";
import { parseTier, selectActiveSubscription } from "@/lib/subscription";
import type { Subscription } from "@/lib/subscription";

/**
 * Returns the current user's active subscription, or null when the user is
 * unauthenticated or has no active subscription.
 *
 * Stat-serving Server Components should call this to get the user's tier before
 * rendering any gated content. Pair with canAccessStat() from @/lib/subscription.
 */
export async function getActiveSubscription(): Promise<Subscription | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return selectActiveSubscription(supabase, user.id);
}

/**
 * Convenience wrapper that returns the numeric tier for the current user, or
 * null when they have no active subscription. Use this at stat call sites:
 *
 *   const tier = await getCurrentUserTier();
 *   if (!canAccessStat(tier, stat.tier)) { ... show upgrade prompt ... }
 */
export async function getCurrentUserTier(): Promise<number | null> {
  const subscription = await getActiveSubscription();
  return parseTier(subscription?.tier);
}
