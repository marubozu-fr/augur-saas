// PlanAndBillingCards — async Server Component.
// Fetches plan name and price from Stripe then renders the "Current plan" and
// "Billing details" cards. Wrapped in <Suspense> in page.tsx so the rest of
// the page renders immediately while Stripe responds.
//
// DEVIATIONS FROM MOCKUP:
// - Payment method (card brand / last-4 / expiry) is NOT displayed. That
//   information is owned by the Stripe Customer Portal. Fetching it server-side
//   would require a separate stripe.paymentMethods.list() call tied to a
//   customer, adding latency and duplicating what the portal already shows.
// - Invoices / "next payment" amount line from the billing card is simplified:
//   we show the price × renewal date (data already available from Stripe price
//   retrieval + Supabase subscription), which covers the most important case.
//   The full invoice history lives in the Stripe Customer Portal.

import Link from "next/link";
import { Zap, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { createStripeClient } from "@/lib/stripe";
import { redirectToBillingPortal } from "./actions";
import type { Subscription } from "@/lib/subscription";
import Stripe from "stripe";

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

interface StripePlanData {
  planName: string;
  amountFormatted: string;
  intervalLabel: string;
}

async function fetchPlanData(
  subscription: Subscription,
  unknownPlanLabel: string,
): Promise<StripePlanData | null> {
  if (!subscription.priceId) return null;

  try {
    const stripe = createStripeClient();
    const price = await stripe.prices.retrieve(subscription.priceId, {
      expand: ["product"],
    });

    const product =
      price.product && typeof price.product === "object"
        ? (price.product as Stripe.Product)
        : null;

    const planName = product?.name ?? unknownPlanLabel;

    const unitAmount = price.unit_amount ?? 0;
    const euros = Math.floor(unitAmount / 100);
    const cents = unitAmount % 100;
    const amountFormatted =
      cents > 0 ? `€${euros}.${String(cents).padStart(2, "0")}` : `€${euros}`;

    const interval = price.recurring?.interval ?? "month";
    const intervalLabel = interval === "year" ? "/ year" : "/ month";

    return { planName, amountFormatted, intervalLabel };
  } catch (err) {
    console.error(
      "[PlanAndBillingCards] fetchPlanData failed for priceId",
      subscription.priceId,
      err,
    );
    // Stripe fetch failed — fail soft. The caller renders a degraded state.
    return null;
  }
}

// ---------------------------------------------------------------------------
// Date formatting helper
// ---------------------------------------------------------------------------

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// No-subscription empty state
// ---------------------------------------------------------------------------

function NoPlanCard() {
  const t = useTranslations("account.plan");

  return (
    <section
      className="rounded-xl border border-border bg-card p-6"
      aria-labelledby="plan-title"
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground" id="plan-title">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-[38ch]">
            {t("noSubscription")}
          </p>
        </div>
      </div>

      <p className="text-2xl font-bold tracking-tight text-foreground">
        {t("noActivePlan")}
      </p>

      <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-brand text-sm font-semibold text-on-brand hover:bg-brand-hover transition-colors"
        >
          <Zap size={15} aria-hidden="true" />
          {t("choosePlan")}
        </Link>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Plan card (populated)
// ---------------------------------------------------------------------------

interface PlanCardProps {
  subscription: Subscription;
  planData: StripePlanData | null;
}

function PlanCard({ subscription, planData }: PlanCardProps) {
  const t = useTranslations("account.plan");
  const planName = planData?.planName ?? t("activePlan");
  const tierNum = subscription.tier ? parseInt(subscription.tier, 10) : null;
  const tierLabel =
    tierNum !== null
      ? tierNum === 1
        ? t("tier", { tier: 1 })
        : Array.from({ length: tierNum }, (_, i) =>
            t("tier", { tier: i + 1 }),
          ).join(" + ")
      : null;

  const renewalDate = subscription.currentPeriodEnd
    ? formatDate(subscription.currentPeriodEnd)
    : null;

  const billingCycle =
    planData?.intervalLabel === "/ year" ? t("annual") : t("monthly");

  return (
    <section
      className="rounded-xl border border-border bg-card p-6"
      aria-labelledby="plan-title"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground" id="plan-title">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-[38ch]">
            {subscription.cancelAtPeriodEnd
              ? t("setToCancelAtPeriodEnd")
              : t("activeAndRenews")}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-up/30 bg-up-soft text-up text-xs font-semibold flex-shrink-0">
          {t("active")}
        </span>
      </div>

      {/* Plan name + price headline */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {planName}
        </span>
        {planData && (
          <span className="text-lg text-muted-foreground">
            <span className="font-semibold text-foreground font-mono">
              {planData.amountFormatted}
            </span>{" "}
            <span className="text-subtle">{planData.intervalLabel}</span>
          </span>
        )}
      </div>

      {/* Detail rows */}
      <dl className="grid grid-cols-[max-content_1fr] gap-y-3 gap-x-5 mt-5 pt-5 border-t border-border text-sm">
        {tierLabel && (
          <>
            <dt className="text-subtle">{t("statsAccess")}</dt>
            <dd className="text-foreground text-right">{tierLabel}</dd>
          </>
        )}
        <dt className="text-subtle">{t("billingCycle")}</dt>
        <dd className="text-foreground text-right">{billingCycle}</dd>
        {renewalDate && (
          <>
            <dt className="text-subtle">
              {subscription.cancelAtPeriodEnd
                ? t("accessUntil")
                : t("renewsOn")}
            </dt>
            <dd className="text-foreground font-mono text-right">
              {renewalDate}
            </dd>
          </>
        )}
      </dl>

      {/* Footer */}
      <div className="flex items-center gap-3 flex-wrap mt-5 pt-5 border-t border-border">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-brand text-sm font-semibold text-on-brand hover:bg-brand-hover transition-colors"
        >
          <Zap size={15} aria-hidden="true" />
          {t("upgradePlan")}
        </Link>
        <span className="text-xs text-subtle">{t("compareAllPlans")}</span>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Billing card
// ---------------------------------------------------------------------------

interface BillingCardProps {
  subscription: Subscription;
  billingEmail: string;
  planData: StripePlanData | null;
}

function BillingCard({
  subscription,
  billingEmail,
  planData,
}: BillingCardProps) {
  const t = useTranslations("account.billing");
  const renewalDate = subscription.currentPeriodEnd
    ? formatDate(subscription.currentPeriodEnd)
    : null;

  return (
    <section
      className="rounded-xl border border-border bg-card p-6"
      aria-labelledby="billing-title"
    >
      {/* Header */}
      <div className="mb-5">
        <h2
          className="text-lg font-semibold text-foreground"
          id="billing-title"
        >
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-[38ch]">
          {t("subtitle")}
        </p>
      </div>

      {/* Detail rows */}
      <dl className="grid grid-cols-[max-content_1fr] gap-y-3 gap-x-5 text-sm">
        {planData && renewalDate && (
          <>
            <dt className="text-subtle">{t("nextPayment")}</dt>
            <dd className="text-foreground font-mono text-right">
              {planData.amountFormatted}{" "}
              <span className="text-subtle font-sans">
                {t("onDate", { date: renewalDate })}
              </span>
            </dd>
          </>
        )}
        <dt className="text-subtle">{t("billingEmail")}</dt>
        <dd className="text-foreground font-mono text-right truncate">
          {billingEmail}
        </dd>
      </dl>

      {/* Footer */}
      <div className="flex items-center gap-3 flex-wrap mt-5 pt-5 border-t border-border">
        <form action={redirectToBillingPortal}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-brand text-sm font-semibold text-on-brand hover:bg-brand-hover transition-colors"
          >
            {t("manageSubscription")}
            <ExternalLink size={14} aria-hidden="true" />
          </button>
        </form>
        <span className="text-xs text-subtle">{t("stripePortalNote")}</span>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Composed export: fetches data and renders both cards
// ---------------------------------------------------------------------------

interface PlanAndBillingCardsProps {
  billingEmail: string;
  subscription: Subscription | null;
}

export async function PlanAndBillingCards({
  billingEmail,
  subscription,
}: PlanAndBillingCardsProps) {
  if (!subscription) {
    return <NoPlanCard />;
  }

  const t = await getTranslations("account.plan");
  const planData = await fetchPlanData(subscription, t("unknownPlan"));

  return (
    <>
      <PlanCard subscription={subscription} planData={planData} />
      <BillingCard
        subscription={subscription}
        billingEmail={billingEmail}
        planData={planData}
      />
    </>
  );
}
