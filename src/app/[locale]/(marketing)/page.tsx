import type { Metadata } from "next";
import NextLink from "next/link";
import { redirect } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import {
  Zap,
  Check,
  TrendingUp,
  Table2,
  Clock,
  ShieldCheck,
  Code2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-mode";
import { buildLanguageAlternates } from "@/i18n/metadata";
import { getStatCatalog } from "@/services/augur";
import { getCatalogCoverage } from "@/lib/stat-context";
import { AUGUR_SAAS_REPO_URL } from "@/lib/constants";
import { HeroPreviewCard } from "./HeroPreviewCard";

// Title/description are inherited from the [locale] layout; this page adds its
// own hreflang alternates for the marketing root.
export function generateMetadata(): Metadata {
  return { alternates: { languages: buildLanguageAlternates("") } };
}

// Shared container class — matches .container in styles.css (max-w 1180px)
const container = "mx-auto w-full max-w-[1180px] px-6";

export default async function LandingPage() {
  const demo = isDemoMode();

  // No Supabase in demo mode, and no signed-in state to redirect from.
  if (!demo) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      redirect("/dashboard");
    }
  }

  const t = await getTranslations("landing");
  const tDemo = await getTranslations("demo");

  // Coverage figures (family count, instrument list, year range) — demo mode
  // only, derived from the catalog rather than hardcoded. See
  // getCatalogCoverage (src/lib/stat-context.ts). Errors are not swallowed —
  // consistent with DemoBanner and the dashboard redirect (PR #132), a failed
  // catalog fetch in demo mode is a real failure, not "0 stat families".
  let startYear = 0;
  let endYear = 0;
  let familyCount = 0;
  let instrumentList = "";
  if (demo) {
    const catalog = await getStatCatalog();
    const coverage = getCatalogCoverage(catalog);
    const format = await getFormatter();
    startYear = coverage.startYear;
    endYear = coverage.endYear;
    familyCount = coverage.familyCount;
    instrumentList = format.list(coverage.instruments, { type: "conjunction" });
  }

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
              {/* Accent pill badge — not rendered in demo mode: "now live"
                  doesn't hold for a frozen demo snapshot. */}
              {!demo && (
                <span className="inline-flex items-center gap-2 mb-6 px-3 py-[5px] rounded-full text-xs font-semibold bg-brand-soft text-brand border border-transparent">
                  <Zap size={13} aria-hidden="true" />
                  {t("hero.badge")}
                </span>
              )}

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
                {demo
                  ? tDemo("landing.hero.subtitle", { startYear, endYear })
                  : t("hero.subtitle")}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mt-6">
                <NextLink
                  href={demo ? "/dashboard" : "/sign-up"}
                  className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-brand text-base font-semibold text-on-brand hover:bg-brand-hover transition-colors"
                >
                  {demo ? tDemo("nav.openDemo") : t("hero.ctaPrimary")}
                </NextLink>
              </div>

              {/* Meta check items */}
              <div className="flex flex-wrap gap-5 mt-6 text-sm text-subtle">
                {demo ? (
                  <>
                    <span className="inline-flex items-center gap-2">
                      <Check size={15} className="text-up" aria-hidden="true" />
                      {tDemo("landing.hero.checklist.statFamilies", {
                        count: familyCount,
                      })}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Check size={15} className="text-up" aria-hidden="true" />
                      {tDemo("landing.hero.checklist.instruments", {
                        list: instrumentList,
                      })}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Check size={15} className="text-up" aria-hidden="true" />
                      {tDemo("landing.hero.checklist.openSource")}
                    </span>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>

            {/* Right: sample stat preview card — real data, see HeroPreviewCard */}
            <HeroPreviewCard />
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
              <span className="opacity-70">
                {demo
                  ? tDemo("landing.trustStrip.history", { startYear, endYear })
                  : t("trustStrip.history")}
              </span>
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

              {/* Feature 3 — "Refreshed daily" is only true in live mode; demo
                  mode swaps it for an "Open source" card. */}
              <article className="rounded-xl border border-border bg-card p-6 hover:border-border-strong hover:-translate-y-0.5 transition-all duration-[180ms]">
                <span
                  className="inline-grid place-items-center w-11 h-11 rounded-lg bg-brand-soft text-brand mb-4"
                  aria-hidden="true"
                >
                  {demo ? <Code2 size={22} /> : <Clock size={22} />}
                </span>
                <h3 className="text-lg font-bold tracking-tight text-foreground mb-2">
                  {demo
                    ? tDemo("landing.features.openSource.title")
                    : t("features.refreshed.title")}
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  {demo
                    ? tDemo("landing.features.openSource.description")
                    : t("features.refreshed.description")}
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
                {demo
                  ? tDemo("landing.howItWorks.heading")
                  : t("howItWorks.heading")}
              </h2>
            </div>

            {/* Steps */}
            <ol className="grid md:grid-cols-3 gap-6 list-none">
              {/* Step 1 — no signup in demo mode */}
              <li className="relative pt-6">
                <span
                  className="absolute top-0 left-0 inline-grid place-items-center w-10 h-10 rounded-full border border-border-strong bg-card text-brand font-mono font-bold"
                  aria-hidden="true"
                >
                  1
                </span>
                <h3 className="text-lg font-bold tracking-tight text-foreground mt-6 mb-2">
                  {demo
                    ? tDemo("landing.howItWorks.step1.title")
                    : t("howItWorks.step1.title")}
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  {demo
                    ? tDemo("landing.howItWorks.step1.description")
                    : t("howItWorks.step1.description")}
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
                  {demo
                    ? tDemo("landing.howItWorks.step3.description")
                    : t("howItWorks.step3.description")}
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* ===================================================================
            CTA BAND — newsletter (live) / open source (demo)
            =================================================================== */}
        <section className="py-24">
          <div className={container}>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-[radial-gradient(80%_120%_at_50%_0%,rgba(14,165,233,0.18),transparent_60%),var(--card)] px-[3rem] py-[4rem] text-center">
              <h2 className="text-[2.25rem] font-bold tracking-tight text-foreground">
                {demo ? tDemo("landing.cta.heading") : t("cta.heading")}
              </h2>
              <p className="mt-4 mx-auto max-w-[32rem] text-muted-foreground leading-[1.55]">
                {demo ? tDemo("landing.cta.description") : t("cta.description")}
              </p>

              {demo ? (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <NextLink
                    href="/dashboard"
                    className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-brand text-base font-semibold text-on-brand hover:bg-brand-hover transition-colors"
                  >
                    {tDemo("nav.openDemo")}
                  </NextLink>
                  <a
                    href={AUGUR_SAAS_REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center h-12 px-6 rounded-md border border-border bg-card text-base font-semibold text-foreground hover:border-border-strong transition-colors"
                  >
                    {tDemo("landing.cta.viewOnGithub")}
                  </a>
                </div>
              ) : (
                <>
                  {/* Single sign-up CTA — newsletter backend not built yet */}
                  <div className="mt-6 flex justify-center">
                    <NextLink
                      href="/sign-up"
                      className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-brand text-base font-semibold text-on-brand hover:bg-brand-hover transition-colors"
                    >
                      {t("hero.ctaPrimary")}
                    </NextLink>
                  </div>

                  <p className="mt-4 text-xs text-subtle">
                    {t("cta.footnote")}
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
