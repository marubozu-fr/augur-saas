import type { Metadata } from "next";
import NextLink from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  Zap,
  Check,
  TrendingUp,
  Table2,
  Clock,
  ShieldCheck,
  ChevronUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buildLanguageAlternates } from "@/i18n/metadata";

// Title/description are inherited from the [locale] layout; this page adds its
// own hreflang alternates for the marketing root.
export function generateMetadata(): Metadata {
  return { alternates: { languages: buildLanguageAlternates("") } };
}

// Shared container class — matches .container in styles.css (max-w 1180px)
const container = "mx-auto w-full max-w-[1180px] px-6";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

  const t = await getTranslations("landing");

  return (
    <>
      <main>
        {/* ===================================================================
            HERO
            =================================================================== */}
        <section className="relative overflow-hidden pt-[8rem] pb-24">
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute inset-x-0 top-[-20%] h-[480px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(14,165,233,0.22),transparent_70%)]"
            aria-hidden="true"
          />

          <div
            className={`${container} relative grid md:grid-cols-[1.05fr_0.95fr] gap-12 items-center`}
          >
            {/* Left: copy */}
            <div>
              {/* Accent pill badge */}
              <span className="inline-flex items-center gap-2 mb-6 px-3 py-[5px] rounded-full text-xs font-semibold bg-brand-soft text-brand border border-transparent">
                <Zap size={13} aria-hidden="true" />
                {t("hero.badge")}
              </span>

              <h1 className="text-[3rem] md:text-[3.75rem] leading-[1.05] font-bold tracking-tight text-foreground">
                {t.rich("hero.headline", {
                  hl: (chunks) => (
                    <span className="bg-gradient-to-r from-[#38bdf8] to-[#22c55e] bg-clip-text text-transparent">
                      {chunks}
                    </span>
                  ),
                  br: () => <br />,
                })}
              </h1>

              <p className="mt-6 text-lg text-muted-foreground max-w-[34rem] leading-[1.55]">
                {t("hero.subtitle")}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mt-6">
                <NextLink
                  href="/sign-up"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-brand text-base font-semibold text-on-brand hover:bg-brand-hover transition-colors"
                >
                  {t("hero.ctaPrimary")}
                </NextLink>
              </div>

              {/* Meta check items */}
              <div className="flex flex-wrap gap-5 mt-6 text-sm text-subtle">
                <span className="inline-flex items-center gap-2">
                  <Check size={15} className="text-up" aria-hidden="true" />
                  {t("hero.checklist.noCard")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check size={15} className="text-up" aria-hidden="true" />
                  {t("hero.checklist.cancelAnytime")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check size={15} className="text-up" aria-hidden="true" />
                  {t("hero.checklist.updatedDaily")}
                </span>
              </div>
            </div>

            {/* Right: sample stat preview card */}
            <div
              className="rounded-xl border border-border bg-card p-6 shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
              aria-label={t("hero.preview.ariaLabel")}
            >
              {/* Card top */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="text-base font-semibold text-foreground">
                    {t("hero.preview.title")}
                  </div>
                  <div className="text-xs text-subtle mt-[2px]">
                    {t("hero.preview.subtitle")}
                  </div>
                </div>
                {/* Tier badge — outline style */}
                <span className="inline-flex items-center gap-1 px-3 py-[5px] rounded-full text-xs font-semibold border border-border bg-surface-2 text-muted-foreground flex-shrink-0">
                  {t("hero.preview.tier")}
                </span>
              </div>

              {/* Big value row */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-[3rem] font-bold leading-none font-mono tabular-nums text-up">
                  63.4%
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-[5px] rounded-full text-xs font-semibold bg-up-soft text-up border border-transparent">
                  <ChevronUp size={12} aria-hidden="true" />
                  {t("hero.preview.edge")}
                </span>
              </div>

              {/* Baseline */}
              <div className="text-sm text-muted-foreground">
                {t("hero.preview.baselineLabel")}{" "}
                <span className="font-mono tabular-nums">53.6%</span>
                {" · "}
                <span className="font-mono tabular-nums">N = 1,284</span>
              </div>

              {/* Preview rows */}
              <div className="mt-5 border-t border-border">
                {/* Row 1 */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-3 border-b border-border text-sm">
                  <span className="text-muted-foreground">
                    {t("hero.preview.row1Label")}
                  </span>
                  <span className="font-semibold font-mono tabular-nums text-up">
                    67.1%
                  </span>
                  <span className="text-xs text-subtle font-mono tabular-nums">
                    N = 251
                  </span>
                </div>
                {/* Row 2 */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-3 border-b border-border text-sm">
                  <span className="text-muted-foreground">
                    {t("hero.preview.row2Label")}
                  </span>
                  <span className="font-semibold font-mono tabular-nums text-up">
                    71.5%
                  </span>
                  <span className="text-xs text-subtle font-mono tabular-nums">
                    N = 388
                  </span>
                </div>
                {/* Row 3 */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-3 border-b border-border text-sm">
                  <span className="text-muted-foreground">
                    {t("hero.preview.row3Label")}
                  </span>
                  <span className="font-semibold font-mono tabular-nums text-down">
                    48.9%
                  </span>
                  <span className="text-xs text-subtle font-mono tabular-nums">
                    N = 243
                  </span>
                </div>
                {/* Row 4 */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-3 border-b border-border text-sm">
                  <span className="text-muted-foreground">
                    {t("hero.preview.row4Label")}
                  </span>
                  <span className="font-semibold font-mono tabular-nums text-neutral">
                    54.0%
                  </span>
                  <span className="text-xs text-subtle font-mono tabular-nums">
                    N = 36
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            LOGO / TRUST STRIP
            =================================================================== */}
        <section className="py-6 border-y border-border">
          <div className={container}>
            <p className="text-center text-xs font-semibold tracking-[0.06em] uppercase text-subtle mb-4">
              {t("trustStrip.heading")}
            </p>
            <div
              className="flex flex-wrap justify-center gap-12 text-subtle font-semibold text-lg"
              aria-label={t("trustStrip.ariaLabel")}
            >
              <span className="opacity-70">NQ · Nasdaq-100</span>
              <span className="opacity-70">ES · S&amp;P 500</span>
              <span className="opacity-70">{t("trustStrip.sessions")}</span>
              <span className="opacity-70">{t("trustStrip.history")}</span>
              <span className="opacity-70">{t("trustStrip.timeframes")}</span>
            </div>
          </div>
        </section>

        {/* ===================================================================
            FEATURES
            =================================================================== */}
        <section className="py-24" id="features">
          <div className={container}>
            {/* Section head */}
            <div className="max-w-[640px] mx-auto mb-12 text-center">
              <span className="inline-block text-sm font-semibold tracking-[0.06em] uppercase text-brand mb-3">
                {t("features.eyebrow")}
              </span>
              <h2 className="text-[2.25rem] font-bold tracking-tight text-foreground">
                {t("features.heading")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-[1.55]">
                {t("features.subtitle")}
              </p>
            </div>

            {/* 4-up card grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Feature 1 */}
              <article className="rounded-xl border border-border bg-card p-6 hover:border-border-strong hover:-translate-y-0.5 transition-all duration-[180ms]">
                <span
                  className="inline-grid place-items-center w-11 h-11 rounded-lg bg-brand-soft text-brand mb-4"
                  aria-hidden="true"
                >
                  <TrendingUp size={22} />
                </span>
                <h3 className="text-lg font-bold tracking-tight text-foreground mb-2">
                  {t("features.baseline.title")}
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  {t("features.baseline.description")}
                </p>
              </article>

              {/* Feature 2 */}
              <article className="rounded-xl border border-border bg-card p-6 hover:border-border-strong hover:-translate-y-0.5 transition-all duration-[180ms]">
                <span
                  className="inline-grid place-items-center w-11 h-11 rounded-lg bg-brand-soft text-brand mb-4"
                  aria-hidden="true"
                >
                  <Table2 size={22} />
                </span>
                <h3 className="text-lg font-bold tracking-tight text-foreground mb-2">
                  {t("features.sliced.title")}
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  {t("features.sliced.description")}
                </p>
              </article>

              {/* Feature 3 */}
              <article className="rounded-xl border border-border bg-card p-6 hover:border-border-strong hover:-translate-y-0.5 transition-all duration-[180ms]">
                <span
                  className="inline-grid place-items-center w-11 h-11 rounded-lg bg-brand-soft text-brand mb-4"
                  aria-hidden="true"
                >
                  <Clock size={22} />
                </span>
                <h3 className="text-lg font-bold tracking-tight text-foreground mb-2">
                  {t("features.refreshed.title")}
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  {t("features.refreshed.description")}
                </p>
              </article>

              {/* Feature 4 */}
              <article className="rounded-xl border border-border bg-card p-6 hover:border-border-strong hover:-translate-y-0.5 transition-all duration-[180ms]">
                <span
                  className="inline-grid place-items-center w-11 h-11 rounded-lg bg-brand-soft text-brand mb-4"
                  aria-hidden="true"
                >
                  <ShieldCheck size={22} />
                </span>
                <h3 className="text-lg font-bold tracking-tight text-foreground mb-2">
                  {t("features.significance.title")}
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  {t("features.significance.description")}
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ===================================================================
            HOW IT WORKS
            =================================================================== */}
        <section className="py-24 bg-muted" id="how">
          <div className={container}>
            {/* Section head */}
            <div className="max-w-[640px] mx-auto mb-12 text-center">
              <span className="inline-block text-sm font-semibold tracking-[0.06em] uppercase text-brand mb-3">
                {t("howItWorks.eyebrow")}
              </span>
              <h2 className="text-[2.25rem] font-bold tracking-tight text-foreground">
                {t("howItWorks.heading")}
              </h2>
            </div>

            {/* Steps */}
            <ol className="grid md:grid-cols-3 gap-6 list-none">
              {/* Step 1 */}
              <li className="relative pt-6">
                <span
                  className="absolute top-0 left-0 inline-grid place-items-center w-10 h-10 rounded-full border border-border-strong bg-card text-brand font-mono font-bold"
                  aria-hidden="true"
                >
                  1
                </span>
                <h3 className="text-lg font-bold tracking-tight text-foreground mt-6 mb-2">
                  {t("howItWorks.step1.title")}
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  {t("howItWorks.step1.description")}
                </p>
              </li>

              {/* Step 2 */}
              <li className="relative pt-6">
                <span
                  className="absolute top-0 left-0 inline-grid place-items-center w-10 h-10 rounded-full border border-border-strong bg-card text-brand font-mono font-bold"
                  aria-hidden="true"
                >
                  2
                </span>
                <h3 className="text-lg font-bold tracking-tight text-foreground mt-6 mb-2">
                  {t("howItWorks.step2.title")}
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  {t("howItWorks.step2.description")}
                </p>
              </li>

              {/* Step 3 */}
              <li className="relative pt-6">
                <span
                  className="absolute top-0 left-0 inline-grid place-items-center w-10 h-10 rounded-full border border-border-strong bg-card text-brand font-mono font-bold"
                  aria-hidden="true"
                >
                  3
                </span>
                <h3 className="text-lg font-bold tracking-tight text-foreground mt-6 mb-2">
                  {t("howItWorks.step3.title")}
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  {t("howItWorks.step3.description")}
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* ===================================================================
            CTA BAND — newsletter
            =================================================================== */}
        <section className="py-24">
          <div className={container}>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-[radial-gradient(80%_120%_at_50%_0%,rgba(14,165,233,0.18),transparent_60%),var(--card)] px-[3rem] py-[4rem] text-center">
              <h2 className="text-[2.25rem] font-bold tracking-tight text-foreground">
                {t("cta.heading")}
              </h2>
              <p className="mt-4 mx-auto max-w-[32rem] text-muted-foreground leading-[1.55]">
                {t("cta.description")}
              </p>

              {/* Single sign-up CTA — newsletter backend not built yet */}
              <div className="mt-6 flex justify-center">
                <NextLink
                  href="/sign-up"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-brand text-base font-semibold text-on-brand hover:bg-brand-hover transition-colors"
                >
                  {t("hero.ctaPrimary")}
                </NextLink>
              </div>

              <p className="mt-4 text-xs text-subtle">{t("cta.footnote")}</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
