"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap } from "lucide-react";

// Valid lookup keys — mirrors stripe-fixtures.json. Server-side validation
// in /api/checkout/route.ts enforces this allowlist; the type here is for
// compile-time safety only.
type LookupKey =
  | "starter_monthly"
  | "starter_annual"
  | "pro_monthly"
  | "pro_annual"
  | "premium_monthly"
  | "premium_annual";

interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyLookupKey: LookupKey | null;
  annualLookupKey: LookupKey | null;
  monthlyPrice: string;
  annualEffectivePrice: string;
  // Annual total from stripe-fixtures.json (not mockup's incorrect 12×monthly):
  // starter: 27600 cents = €276/yr, pro: 75600 = €756/yr, premium: 142800 = €1,428/yr
  annualTotal: string;
  cta: string;
  ctaHref?: string;
  featured: boolean;
  tierLabel: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline:
      "For the discretionary trader testing Augur on a single instrument.",
    monthlyLookupKey: "starter_monthly",
    annualLookupKey: "starter_annual",
    monthlyPrice: "€29",
    annualEffectivePrice: "€23",
    annualTotal: "€276",
    cta: "Start free trial",
    featured: false,
    tierLabel: "Tier 1 stats",
    features: [
      "18 Tier 1 stat families",
      "NQ & ES coverage",
      "Daily refresh after the close",
      "3-year historical depth",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline:
      "For the active trader who wants every slice and finer conditioning.",
    monthlyLookupKey: "pro_monthly",
    annualLookupKey: "pro_annual",
    monthlyPrice: "€79",
    annualEffectivePrice: "€63",
    annualTotal: "€756",
    cta: "Start free trial",
    featured: true,
    tierLabel: "Tier 1 + 2 stats",
    features: [
      "36 stat families (Tier 1 + 2)",
      "All slices: weekday, gap, regime",
      "10-year historical depth",
      "CSV export & saved views",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "For the systematic trader who needs full history and API access.",
    monthlyLookupKey: "premium_monthly",
    annualLookupKey: "premium_annual",
    monthlyPrice: "€149",
    annualEffectivePrice: "€119",
    annualTotal: "€1,428",
    cta: "Start free trial",
    featured: false,
    tierLabel: "Tier 1–3 stats",
    features: [
      "54 stat families (Tier 1–3)",
      "REST API access & webhooks",
      "Full 18-year history",
      "Priority email support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For desks and funds needing seats, SLAs, and the full data feed.",
    monthlyLookupKey: null,
    annualLookupKey: null,
    monthlyPrice: "Custom",
    annualEffectivePrice: "",
    annualTotal: "",
    cta: "Contact sales",
    ctaHref: "mailto:sales@example.com",
    featured: false,
    tierLabel: "All tiers + enterprise",
    features: [
      "Everything in Premium",
      "Unlimited team seats",
      "Raw data feed & higher rate limits",
      "Dedicated manager & 99.9% SLA",
    ],
  },
];

type ButtonVariant = "primary" | "outline" | "secondary";

interface SubscribeButtonProps {
  plan: Plan;
  isAnnual: boolean;
  variant: ButtonVariant;
  size?: "lg" | "sm";
  block?: boolean;
}

function SubscribeButton({
  plan,
  isAnnual,
  variant,
  size = "lg",
  block = false,
}: SubscribeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeClass = size === "lg" ? "h-12 px-6 text-base" : "h-8 px-3 text-xs";
  const blockClass = block ? "w-full" : "";

  const variantClass =
    variant === "primary"
      ? "bg-brand text-on-brand hover:bg-brand-hover disabled:opacity-60"
      : variant === "outline"
        ? "bg-transparent border border-border-strong text-foreground hover:bg-card disabled:opacity-60"
        : "bg-surface-2 text-foreground border border-border hover:bg-card hover:border-border-strong disabled:opacity-60";

  // Enterprise: no Stripe price, link to mailto
  if (plan.ctaHref) {
    return (
      <a
        href={plan.ctaHref}
        className={`inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-colors ${sizeClass} ${blockClass} ${variantClass}`}
      >
        {plan.cta}
      </a>
    );
  }

  const lookupKey = isAnnual ? plan.annualLookupKey : plan.monthlyLookupKey;

  const handleClick = async () => {
    if (!lookupKey) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookupKey }),
      });

      const data = (await res.json()) as {
        url?: string;
        error?: string;
        redirectTo?: string;
      };

      if (!res.ok) {
        if (data.redirectTo) {
          router.push(data.redirectTo);
          return;
        }
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${block ? "w-full" : ""}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-colors ${sizeClass} ${blockClass} ${variantClass}`}
      >
        {loading ? "Redirecting…" : plan.cta}
      </button>
      {error && <p className="text-xs text-down text-center">{error}</p>}
    </div>
  );
}

// Check icon cell for comparison table
function CellYes() {
  return (
    <span
      className="inline-grid place-items-center text-brand"
      aria-label="Included"
    >
      <Check size={16} aria-hidden="true" />
    </span>
  );
}

// Dash cell for comparison table
function CellNo() {
  return (
    <span className="text-subtle" aria-label="Not included">
      —
    </span>
  );
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <>
      {/* ===================================================================
          PRICING HERO + BILLING TOGGLE
          =================================================================== */}
      <section className="relative overflow-hidden pt-24 pb-8 text-center">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[-20%] h-[420px] bg-[radial-gradient(55%_60%_at_50%_0%,rgba(14,165,233,0.20),transparent_70%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-[640px] px-6">
          <span className="inline-block text-sm font-semibold tracking-[0.06em] uppercase text-brand mb-3">
            Pricing
          </span>
          <h1 className="text-[3rem] font-bold tracking-tight text-foreground mt-3">
            Pick the tier your strategy needs
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-[1.55]">
            Every plan unlocks a deeper slice of the Augur stat catalog. Start
            free for 7 days, no card required — upgrade, downgrade, or cancel
            whenever you like.
          </p>

          {/* Monthly / annual segmented toggle */}
          <div className="inline-flex items-center gap-3 mt-6 flex-wrap justify-center">
            <div
              className="inline-flex p-1 bg-card border border-border rounded-full"
              role="group"
              aria-label="Billing period"
            >
              <button
                type="button"
                aria-pressed={!isAnnual}
                onClick={() => setIsAnnual(false)}
                className={`px-4 h-9 rounded-full text-sm font-semibold transition-colors ${
                  !isAnnual
                    ? "bg-brand text-on-brand"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                aria-pressed={isAnnual}
                onClick={() => setIsAnnual(true)}
                className={`px-4 h-9 rounded-full text-sm font-semibold transition-colors ${
                  isAnnual
                    ? "bg-brand text-on-brand"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual
              </button>
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-[5px] rounded-full text-xs font-semibold bg-brand-soft text-brand border border-transparent whitespace-nowrap">
              <Zap size={13} aria-hidden="true" />
              Save 20% — 2 months free annually
            </span>
          </div>
        </div>
      </section>

      {/* ===================================================================
          PRICING CARDS — 4 tiers
          =================================================================== */}
      <section className="pb-24">
        <div className="mx-auto w-full max-w-[1180px] px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {PLANS.map((plan) => (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-xl border bg-card p-6 transition-all duration-[180ms] ${
                  plan.featured
                    ? "border-brand shadow-[0_0_0_1px_rgba(14,165,233,0.45),0_8px_40px_rgba(14,165,233,0.25)]"
                    : "border-border hover:border-border-strong hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
                }`}
              >
                {/* "Most popular" badge — positioned above card top border */}
                {plan.featured && (
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-3 py-[5px] rounded-full text-xs font-semibold bg-brand-soft text-brand border border-transparent whitespace-nowrap">
                    Most popular
                  </span>
                )}

                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-[5px] rounded-full text-xs font-semibold border ${
                      plan.featured
                        ? "bg-brand-soft border-transparent text-brand"
                        : "bg-surface-2 border-border text-muted-foreground"
                    }`}
                  >
                    {plan.name}
                  </span>
                  <p className="mt-2 text-sm text-muted-foreground min-h-[2.6em] leading-[1.55]">
                    {plan.tagline}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-6">
                  <span className="text-[3rem] font-bold tracking-tight font-mono tabular-nums text-foreground">
                    {plan.monthlyLookupKey !== null
                      ? isAnnual
                        ? plan.annualEffectivePrice
                        : plan.monthlyPrice
                      : plan.monthlyPrice}
                  </span>
                  {plan.monthlyLookupKey !== null && (
                    <span className="text-sm text-subtle">/ month</span>
                  )}
                </div>

                {/* Billed note */}
                <p className="mt-2 text-xs text-subtle min-h-[1.2em]">
                  {plan.monthlyLookupKey !== null ? (
                    isAnnual ? (
                      <>
                        Billed annually ·{" "}
                        <span className="font-mono tabular-nums">
                          {plan.annualTotal}
                        </span>{" "}
                        / yr
                      </>
                    ) : (
                      <>
                        Billed monthly ·{" "}
                        <span className="font-mono tabular-nums">
                          {plan.monthlyPrice}
                        </span>
                        /mo
                      </>
                    )
                  ) : (
                    "Annual contract · volume pricing"
                  )}
                </p>

                {/* CTA */}
                <div className="mt-6">
                  <SubscribeButton
                    plan={plan}
                    isAnnual={isAnnual}
                    variant={
                      plan.featured
                        ? "primary"
                        : plan.id === "enterprise"
                          ? "secondary"
                          : "outline"
                    }
                    size="lg"
                    block
                  />
                </div>

                {/* Feature list */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs font-semibold tracking-[0.06em] uppercase text-subtle mb-3">
                    {plan.tierLabel}
                  </p>
                  <ul className="grid gap-3 text-sm list-none">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="grid grid-cols-[auto_1fr] gap-3 items-start text-muted-foreground"
                      >
                        <Check
                          size={16}
                          className="text-brand mt-[0.15em] flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          FEATURE COMPARISON TABLE
          Static content + interactive CTA row (needs isAnnual state).
          Keeping the full table here avoids prop-drilling isAnnual.
          =================================================================== */}
      <section className="py-24 bg-muted">
        <div className="mx-auto w-full max-w-[1180px] px-6">
          <div className="max-w-[640px] mx-auto mb-12 text-center">
            <span className="inline-block text-sm font-semibold tracking-[0.06em] uppercase text-brand mb-3">
              Compare plans
            </span>
            <h2 className="text-[2.25rem] font-bold tracking-tight text-foreground">
              Everything, side by side
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-[1.55]">
              The detailed breakdown of what each tier unlocks. Prices shown are
              monthly.
            </p>
          </div>

          {/* Horizontal scroll on mobile */}
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch border border-border rounded-xl bg-card">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <caption className="sr-only">
                Feature comparison across all four plans
              </caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky top-0 bg-surface-2 text-left text-sm font-bold text-foreground px-5 py-4 border-b border-border"
                  >
                    Feature
                  </th>
                  {PLANS.map((plan) => (
                    <th
                      key={plan.id}
                      scope="col"
                      className={`sticky top-0 bg-surface-2 text-center text-sm font-bold px-3 py-4 border-b border-border ${
                        plan.featured ? "text-brand" : "text-foreground"
                      }`}
                    >
                      {plan.name}
                      <span
                        className={`block text-xs font-medium text-subtle mt-[2px] ${
                          plan.monthlyLookupKey ? "font-mono" : ""
                        }`}
                      >
                        {plan.monthlyPrice}
                        {plan.monthlyLookupKey ? " / mo" : ""}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Group: Stats access */}
                <tr>
                  <th
                    colSpan={5}
                    className="text-left text-xs font-bold tracking-[0.06em] uppercase text-subtle px-5 py-3 border-b border-border bg-muted"
                  >
                    Stats access
                  </th>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    Tier 1 stats
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <CellYes />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    Tier 2 stats
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellNo />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <CellYes />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    Tier 3 stats
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellNo />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <CellNo />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    Stat families included
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">18</span>
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <span className="font-mono tabular-nums">36</span>
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">54</span>
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">54</span> + custom
                  </td>
                </tr>

                {/* Group: Data & depth */}
                <tr>
                  <th
                    colSpan={5}
                    className="text-left text-xs font-bold tracking-[0.06em] uppercase text-subtle px-5 py-3 border-b border-border bg-muted"
                  >
                    Data &amp; depth
                  </th>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    Historical depth
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">3</span> yrs
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <span className="font-mono tabular-nums">10</span> yrs
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">18</span> yrs
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">18</span> yrs
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    Refresh frequency
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    Daily
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    Daily
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    Daily
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    Intraday
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    Conditional slices
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    Weekday only
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    All slices
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    All slices
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    All + custom
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    CSV export
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellNo />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <CellYes />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    REST API access
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellNo />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <CellNo />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    API rate limit
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellNo />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <CellNo />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">5k</span> / day
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">100k</span> / day
                  </td>
                </tr>

                {/* Group: Team & support */}
                <tr>
                  <th
                    colSpan={5}
                    className="text-left text-xs font-bold tracking-[0.06em] uppercase text-subtle px-5 py-3 border-b border-border bg-muted"
                  >
                    Team &amp; support
                  </th>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    Seats included
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">1</span>
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <span className="font-mono tabular-nums">1</span>
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">3</span>
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    Support level
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    Community
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    Email
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    Priority email
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    Dedicated manager
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    Uptime SLA
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellNo />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <CellNo />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellNo />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">99.9%</span>
                  </td>
                </tr>

                {/* CTA row */}
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-5"
                  />
                  <td className="text-center px-3 py-5 border-l border-l-border">
                    <SubscribeButton
                      plan={PLANS[0]}
                      isAnnual={isAnnual}
                      variant="outline"
                      size="sm"
                    />
                  </td>
                  <td className="text-center px-3 py-5 border-l border-l-border bg-brand-soft">
                    <SubscribeButton
                      plan={PLANS[1]}
                      isAnnual={isAnnual}
                      variant="primary"
                      size="sm"
                    />
                  </td>
                  <td className="text-center px-3 py-5 border-l border-l-border">
                    <SubscribeButton
                      plan={PLANS[2]}
                      isAnnual={isAnnual}
                      variant="outline"
                      size="sm"
                    />
                  </td>
                  <td className="text-center px-3 py-5 border-l border-l-border">
                    <SubscribeButton
                      plan={PLANS[3]}
                      isAnnual={isAnnual}
                      variant="secondary"
                      size="sm"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
