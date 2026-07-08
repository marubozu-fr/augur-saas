// Account & billing page — Server Component.
// The app shell (grid + Sidebar) is provided by the (dashboard) layout.
// This page renders profile settings (static, Supabase-only data) immediately
// and streams the plan + billing cards via <Suspense> while Stripe responds.

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveSubscription } from "@/lib/subscription.server";
import type { Subscription } from "@/lib/subscription";
import { isLocale } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import { PlanAndBillingCards } from "./PlanAndBillingCards";
import { AccountSkeleton } from "./AccountSkeleton";
import { EmailField } from "./EmailField";
import { PasswordForm } from "./PasswordForm";
import { LanguageSelect } from "./LanguageSelect";
import { redirectToBillingPortal } from "./actions";

export default async function AccountPage() {
  const t = await getTranslations("account");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userEmail = user.email ?? "";

  // Current language preference (null = auto-detect). Read alongside the
  // subscription below; failure here degrades to "Auto" rather than blocking
  // the page.
  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_locale")
    .eq("id", user.id)
    .single();

  const rawPreferredLocale = profile?.preferred_locale;
  const preferredLocale: Locale | null =
    typeof rawPreferredLocale === "string" && isLocale(rawPreferredLocale)
      ? rawPreferredLocale
      : null;

  // Fetch the subscription once here (Supabase only, no Stripe call) and pass it
  // down to PlanAndBillingCards — getActiveSubscription() does not use fetch(),
  // so Next.js would not dedupe a second call. The <Suspense> stream still works
  // because the slow part lives in PlanAndBillingCards' Stripe price lookup.
  let subscription: Subscription | null = null;
  try {
    subscription = await getActiveSubscription();
  } catch (err) {
    console.error(
      "[AccountPage] getActiveSubscription failed for user",
      user.id,
      err,
    );
    // Fail open — keep the danger zone hidden if we can't confirm a subscription.
  }

  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd ?? false;
  const currentPeriodEnd = subscription?.currentPeriodEnd ?? null;

  const renewalDateLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <main className="p-6">
      <div className="max-w-[720px]">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("heading")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("subheading")}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {/* ============================================================
              Plan + Billing cards — streamed while Stripe responds.
              ============================================================ */}
          <Suspense fallback={<AccountSkeleton />}>
            <PlanAndBillingCards
              billingEmail={userEmail}
              subscription={subscription}
            />
          </Suspense>

          {/* ============================================================
              3 — Profile settings
              ============================================================ */}
          <section
            className="rounded-xl border border-border bg-card p-6"
            aria-labelledby="profile-title"
          >
            <div className="mb-5">
              <h2
                className="text-lg font-semibold text-foreground"
                id="profile-title"
              >
                {t("profile.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-[38ch]">
                {t("profile.subtitle")}
              </p>
            </div>

            {/* Email field — client component for inline change flow */}
            <EmailField currentEmail={userEmail} />

            {/* Password form — client component for feedback */}
            <PasswordForm />

            {/* Language preference — immediate save on change */}
            <LanguageSelect preferredLocale={preferredLocale} />
          </section>

          {/* ============================================================
              4 — Danger zone — only when there is a subscription to cancel.
              ============================================================ */}
          {subscription && (
            <section
              className="rounded-xl border bg-card p-6 border-down/35"
              aria-labelledby="danger-title"
            >
              <div className="mb-4">
                <h2
                  className="text-lg font-semibold text-down"
                  id="danger-title"
                >
                  {t("danger.title")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-[38ch]">
                  {cancelAtPeriodEnd
                    ? t("danger.alreadyCancelling")
                    : renewalDateLabel
                      ? t("danger.keepAccessUntil", { date: renewalDateLabel })
                      : t("danger.keepAccessUntilUnknown")}
                </p>
              </div>

              {/* Stripe portal redirect — same action as "Manage subscription". */}
              <form action={redirectToBillingPortal}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center h-10 px-5 rounded-md border border-border-strong text-sm font-semibold text-foreground hover:bg-surface-2 transition-colors"
                >
                  {t("danger.cancelInPortal")}
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
