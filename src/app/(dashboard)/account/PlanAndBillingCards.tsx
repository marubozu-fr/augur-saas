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

    const planName = product?.name ?? "Unknown plan";

    const unitAmount = price.unit_amount ?? 0;
    const euros = Math.floor(unitAmount / 100);
    const cents = unitAmount % 100;
    const amountFormatted =
      cents > 0 ? `€${euros}.${String(cents).padStart(2, "0")}` : `€${euros}`;

    const interval = price.recurring?.interval ?? "month";
    const intervalLabel = interval === "year" ? "/ year" : "/ month";

    return { planName, amountFormatted, intervalLabel };
  } catch (err) {
    console.error("[PlanAndBillingCards] fetchPlanData failed for priceId", subscription.priceId, err);
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
  return (
    <section
      className="rounded-xl border border-border bg-card p-6"
      aria-labelledby="plan-title"
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground" id="plan-title">
            Current plan
          </h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-[38ch]">
            You don&apos;t have an active subscription.
          </p>
        </div>
      </div>

      <p className="text-2xl font-bold tracking-tight text-foreground">
        No active plan
      </p>

      <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-brand text-sm font-semibold text-on-brand hover:bg-brand-hover transition-colors"
        >
          <Zap size={15} aria-hidden="true" />
          Choose a plan
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
  const planName = planData?.planName ?? "Active plan";
  const tierNum = subscription.tier ? parseInt(subscription.tier, 10) : null;
  const tierLabel =
    tierNum !== null
      ? tierNum === 1
        ? "Tier 1"
        : Array.from({ length: tierNum }, (_, i) => `Tier ${i + 1}`).join(" + ")
      : null;

  const renewalDate = subscription.currentPeriodEnd
    ? formatDate(subscription.currentPeriodEnd)
    : null;

  const billingCycle =
    planData?.intervalLabel === "/ year" ? "Annual" : "Monthly";

  return (
    <section
      className="rounded-xl border border-border bg-card p-6"
      aria-labelledby="plan-title"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground" id="plan-title">
            Current plan
          </h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-[38ch]">
            {subscription.cancelAtPeriodEnd
              ? "Your subscription is set to cancel at the end of this period."
              : "Your subscription is active and renews automatically."}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-up/30 bg-up-soft text-up text-xs font-semibold flex-shrink-0">
          Active
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
            <dt className="text-subtle">Stats access</dt>
            <dd className="text-foreground text-right">{tierLabel}</dd>
          </>
        )}
        <dt className="text-subtle">Billing cycle</dt>
        <dd className="text-foreground text-right">{billingCycle}</dd>
        {renewalDate && (
          <>
            <dt className="text-subtle">
              {subscription.cancelAtPeriodEnd ? "Access until" : "Renews on"}
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
          Upgrade plan
        </Link>
        <span className="text-xs text-subtle">
          Compare all plans on the pricing page.
        </span>
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
          Billing details
        </h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-[38ch]">
          Payment method, invoices, and cancellation are managed in the secure
          Stripe portal.
        </p>
      </div>

      {/* Detail rows */}
      <dl className="grid grid-cols-[max-content_1fr] gap-y-3 gap-x-5 text-sm">
        {planData && renewalDate && (
          <>
            <dt className="text-subtle">Next payment</dt>
            <dd className="text-foreground font-mono text-right">
              {planData.amountFormatted}{" "}
              <span className="text-subtle font-sans">on {renewalDate}</span>
            </dd>
          </>
        )}
        <dt className="text-subtle">Billing email</dt>
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
            Manage subscription
            <ExternalLink size={14} aria-hidden="true" />
          </button>
        </form>
        <span className="text-xs text-subtle">
          Opens the Stripe portal — invoice history &amp; receipts live there.
        </span>
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

  const planData = await fetchPlanData(subscription);

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
