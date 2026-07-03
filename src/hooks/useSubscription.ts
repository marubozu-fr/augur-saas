"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { parseTier, selectActiveSubscription } from "@/lib/subscription";
import type { Subscription } from "@/lib/subscription";

interface UseSubscriptionResult {
  subscription: Subscription | null;
  tier: number | null;
  isActive: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Returns the current user's active subscription state for use in client
 * components (e.g. to show/hide upgrade prompts or reflect billing status).
 *
 * The browser Supabase client is scoped by RLS to the authenticated user, so
 * no userId needs to be passed explicitly — the query is automatically filtered.
 */
export function useSubscription(): UseSubscriptionResult {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSubscription(): Promise<void> {
      try {
        const supabase = createClient();

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          if (!cancelled) {
            setError(userError.message);
            setSubscription(null);
          }
          return;
        }

        if (!user) {
          if (!cancelled) setSubscription(null);
          return;
        }

        const result = await selectActiveSubscription(supabase, user.id);
        if (!cancelled) setSubscription(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setSubscription(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    subscription,
    tier: parseTier(subscription?.tier),
    isActive: subscription !== null,
    loading,
    error,
  };
}
