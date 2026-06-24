// Isomorphic subscription helpers.
// No server-only imports — safe to use in middleware, server components, and
// client hooks alike. All logic is pure and free of side effects.

import type { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

export const ACTIVE_STATUSES = ["active", "trialing"] as const;

export type SubscriptionStatus = (typeof ACTIVE_STATUSES)[number] | string;

// ---------------------------------------------------------------------------
// Subscription interface (camelCase, mirrors the subscriptions table columns)
// ---------------------------------------------------------------------------

export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  tier: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  priceId: string | null;
  productId: string | null;
}

// ---------------------------------------------------------------------------
// Raw wire type (snake_case, as returned by Supabase)
// ---------------------------------------------------------------------------

interface RawSubscription {
  id: string;
  user_id: string;
  status: string;
  tier: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  price_id: string | null;
  product_id: string | null;
}

// ---------------------------------------------------------------------------
// Mapper: snake_case → camelCase
// ---------------------------------------------------------------------------

function mapSubscription(raw: RawSubscription): Subscription {
  return {
    id: raw.id,
    userId: raw.user_id,
    status: raw.status,
    tier: raw.tier,
    currentPeriodEnd: raw.current_period_end,
    cancelAtPeriodEnd: raw.cancel_at_period_end,
    priceId: raw.price_id,
    productId: raw.product_id,
  };
}

// ---------------------------------------------------------------------------
// Tier helpers
// ---------------------------------------------------------------------------

/**
 * Parse the text tier stored in Supabase ("1", "2", "3", "4") into a number.
 * Returns null when the value is absent or not a valid positive integer.
 */
export function parseTier(tier: string | null | undefined): number | null {
  if (!tier) return null;
  const parsed = parseInt(tier, 10);
  if (isNaN(parsed) || parsed < 1) return null;
  return parsed;
}

/**
 * Returns true when the user's tier is sufficient to access a stat of the
 * given tier. A null userTier means no active subscription → deny.
 */
export function canAccessStat(
  userTier: number | null,
  statTier: number,
): boolean {
  return userTier !== null && userTier >= statTier;
}

// ---------------------------------------------------------------------------
// Shared DB query — reused by middleware, server helper, and the client hook
// ---------------------------------------------------------------------------

/**
 * Fetches the user's active subscription row from Supabase, maps it to the
 * camelCase Subscription interface, and returns it. Returns null when no active
 * subscription exists.
 *
 * The caller is responsible for supplying a SupabaseClient that is scoped to
 * the current user (either via cookie-based auth or RLS). The browser client
 * relies on RLS to scope results automatically.
 */
export async function selectActiveSubscription(
  supabase: SupabaseClient,
  userId: string,
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "id, user_id, status, tier, current_period_end, cancel_at_period_end, price_id, product_id",
    )
    .eq("user_id", userId)
    .in("status", ACTIVE_STATUSES)
    // A user may briefly hold more than one active row during a plan change.
    // Pick the one whose period ends furthest in the future, deterministically.
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Distinguish a real DB/RLS failure from "no active subscription". Throwing on
  // error lets callers decide: the middleware fails open (don't bounce a paying
  // user on a transient error), while UI call sites can surface the error.
  if (error) {
    throw new Error(`Subscription query failed: ${error.message}`);
  }
  if (!data) return null;

  return mapSubscription(data as RawSubscription);
}
