"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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

// Prices are currency amounts, not language content — identical across
// locales. Only the surrounding copy (name, tagline, features, CTA) is
// translated, via the `pricing.plans.*` messages.
function usePlans(t: ReturnType<typeof useTranslations>): Plan[] {
  return [
    {
      id: "starter",
      name: t("plans.starter.name"),
      tagline: t("plans.starter.tagline"),
      monthlyLookupKey: "starter_monthly",
      annualLookupKey: "starter_annual",
      monthlyPrice: "€29",
      annualEffectivePrice: "€23",
      annualTotal: "€276",
      cta: t("plans.starter.cta"),
      featured: false,
      tierLabel: t("plans.starter.tierLabel"),
      features: t.raw("plans.starter.features") as string[],
    },
    {
      id: "pro",
      name: t("plans.pro.name"),
      tagline: t("plans.pro.tagline"),
      monthlyLookupKey: "pro_monthly",
      annualLookupKey: "pro_annual",
      monthlyPrice: "€79",
      annualEffectivePrice: "€63",
      annualTotal: "€756",
      cta: t("plans.pro.cta"),
      featured: true,
      tierLabel: t("plans.pro.tierLabel"),
      features: t.raw("plans.pro.features") as string[],
    },
    {
      id: "premium",
      name: t("plans.premium.name"),
      tagline: t("plans.premium.tagline"),
      monthlyLookupKey: "premium_monthly",
      annualLookupKey: "premium_annual",
      monthlyPrice: "€149",
      annualEffectivePrice: "€119",
      annualTotal: "€1,428",
      cta: t("plans.premium.cta"),
      featured: false,
      tierLabel: t("plans.premium.tierLabel"),
      features: t.raw("plans.premium.features") as string[],
    },
    {
      id: "enterprise",
      name: t("plans.enterprise.name"),
      tagline: t("plans.enterprise.tagline"),
      monthlyLookupKey: null,
      annualLookupKey: null,
      monthlyPrice: t("plans.enterprise.price"),
      annualEffectivePrice: "",
      annualTotal: "",
      cta: t("plans.enterprise.cta"),
      ctaHref: "mailto:sales@example.com",
      featured: false,
      tierLabel: t("plans.enterprise.tierLabel"),
      features: t.raw("plans.enterprise.features") as string[],
    },
  ];
}

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
  const t = useTranslations("pricing");
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
        setError(data.error ?? t("errors.generic"));
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError(t("errors.network"));
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
        {loading ? t("redirecting") : plan.cta}
      </button>
      {error && <p className="text-xs text-down text-center">{error}</p>}
    </div>
  );
}

// Check icon cell for comparison table
function CellYes({ label }: { label: string }) {
  return (
    <span
      className="inline-grid place-items-center text-brand"
      aria-label={label}
    >
      <Check size={16} aria-hidden="true" />
    </span>
  );
}

// Dash cell for comparison table
function CellNo({ label }: { label: string }) {
  return (
    <span className="text-subtle" aria-label={label}>
      —
    </span>
  );
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const t = useTranslations("pricing");
  const PLANS = usePlans(t);
  const included = t("compare.included");
  const notIncluded = t("compare.notIncluded");

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
            {t("hero.eyebrow")}
          </span>
          <h1 className="text-[3rem] font-bold tracking-tight text-foreground mt-3">
            {t("hero.heading")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-[1.55]">
            {t("hero.subtitle")}
          </p>

          {/* Monthly / annual segmented toggle */}
          <div className="inline-flex items-center gap-3 mt-6 flex-wrap justify-center">
            <div
              className="inline-flex p-1 bg-card border border-border rounded-full"
              role="group"
              aria-label={t("toggle.ariaLabel")}
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
                {t("toggle.monthly")}
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
                {t("toggle.annual")}
              </button>
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-[5px] rounded-full text-xs font-semibold bg-brand-soft text-brand border border-transparent whitespace-nowrap">
              <Zap size={13} aria-hidden="true" />
              {t("toggle.saveBadge")}
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
                    {t("mostPopular")}
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
                    <span className="text-sm text-subtle">{t("perMonth")}</span>
                  )}
                </div>

                {/* Billed note */}
                <p className="mt-2 text-xs text-subtle min-h-[1.2em]">
                  {plan.monthlyLookupKey !== null ? (
                    isAnnual ? (
                      <>
                        {t("billedAnnually")}{" "}
                        <span className="font-mono tabular-nums">
                          {plan.annualTotal}
                        </span>{" "}
                        {t("perYearShort")}
                      </>
                    ) : (
                      <>
                        {t("billedMonthly")}{" "}
                        <span className="font-mono tabular-nums">
                          {plan.monthlyPrice}
                        </span>
                        {t("perMonthShort")}
                      </>
                    )
                  ) : (
                    t("annualContract")
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
              {t("compare.eyebrow")}
            </span>
            <h2 className="text-[2.25rem] font-bold tracking-tight text-foreground">
              {t("compare.heading")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-[1.55]">
              {t("compare.subtitle")}
            </p>
          </div>

          {/* Horizontal scroll on mobile */}
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch border border-border rounded-xl bg-card">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <caption className="sr-only">{t("compare.caption")}</caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky top-0 bg-surface-2 text-left text-sm font-bold text-foreground px-5 py-4 border-b border-border"
                  >
                    {t("compare.featureColumn")}
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
                        {plan.monthlyLookupKey ? t("perMonthTable") : ""}
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
                    {t("compare.groups.statsAccess")}
                  </th>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    {t("compare.rows.tier1Stats")}
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes label={included} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <CellYes label={included} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes label={included} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes label={included} />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    {t("compare.rows.tier2Stats")}
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellNo label={notIncluded} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <CellYes label={included} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes label={included} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes label={included} />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    {t("compare.rows.tier3Stats")}
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellNo label={notIncluded} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <CellNo label={notIncluded} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes label={included} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes label={included} />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    {t("compare.rows.statFamilies")}
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
                    <span className="font-mono tabular-nums">54</span>{" "}
                    {t("compare.plusCustom")}
                  </td>
                </tr>

                {/* Group: Data & depth */}
                <tr>
                  <th
                    colSpan={5}
                    className="text-left text-xs font-bold tracking-[0.06em] uppercase text-subtle px-5 py-3 border-b border-border bg-muted"
                  >
                    {t("compare.groups.dataDepth")}
                  </th>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    {t("compare.rows.historicalDepth")}
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">3</span>{" "}
                    {t("compare.years")}
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <span className="font-mono tabular-nums">10</span>{" "}
                    {t("compare.years")}
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">18</span>{" "}
                    {t("compare.years")}
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">18</span>{" "}
                    {t("compare.years")}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    {t("compare.rows.refreshFrequency")}
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    {t("compare.daily")}
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    {t("compare.daily")}
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    {t("compare.daily")}
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    {t("compare.intraday")}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    {t("compare.rows.conditionalSlices")}
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    {t("compare.weekdayOnly")}
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    {t("compare.allSlices")}
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    {t("compare.allSlices")}
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    {t("compare.allPlusCustom")}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    {t("compare.rows.csvExport")}
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellNo label={notIncluded} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <CellYes label={included} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes label={included} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes label={included} />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    {t("compare.rows.restApiAccess")}
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellNo label={notIncluded} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <CellNo label={notIncluded} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes label={included} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellYes label={included} />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    {t("compare.rows.apiRateLimit")}
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellNo label={notIncluded} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <CellNo label={notIncluded} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">5k</span>{" "}
                    {t("compare.perDay")}
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <span className="font-mono tabular-nums">100k</span>{" "}
                    {t("compare.perDay")}
                  </td>
                </tr>

                {/* Group: Team & support */}
                <tr>
                  <th
                    colSpan={5}
                    className="text-left text-xs font-bold tracking-[0.06em] uppercase text-subtle px-5 py-3 border-b border-border bg-muted"
                  >
                    {t("compare.groups.teamSupport")}
                  </th>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    {t("compare.rows.seatsIncluded")}
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
                    {t("compare.unlimited")}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    {t("compare.rows.supportLevel")}
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    {t("compare.community")}
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    {t("compare.email")}
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    {t("compare.priorityEmail")}
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    {t("compare.dedicatedManager")}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="text-left font-medium text-foreground px-5 py-3 border-b border-border whitespace-nowrap"
                  >
                    {t("compare.rows.uptimeSla")}
                  </th>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellNo label={notIncluded} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border bg-brand-soft">
                    <CellNo label={notIncluded} />
                  </td>
                  <td className="text-center text-muted-foreground px-3 py-3 border-b border-border border-l border-l-border">
                    <CellNo label={notIncluded} />
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
