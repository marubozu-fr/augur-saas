import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Zap,
  ArrowRight,
  Check,
  TrendingUp,
  Table2,
  Clock,
  ShieldCheck,
  ChevronUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Augur — Statistical Market Probabilities for Futures Traders",
  description:
    "Augur turns 18 years of NQ and ES futures data into clean, conditional probabilities. Every edge is shown against its baseline, with the sample size in plain sight.",
};

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
                New — overnight gap continuation stats now live
              </span>

              <h1 className="text-[3rem] md:text-[3.75rem] leading-[1.05] font-bold tracking-tight text-foreground">
                Trade the{" "}
                <span className="bg-gradient-to-r from-[#38bdf8] to-[#22c55e] bg-clip-text text-transparent">
                  probabilities
                </span>
                ,<br />
                not the predictions.
              </h1>

              <p className="mt-6 text-lg text-muted-foreground max-w-[34rem] leading-[1.55]">
                Augur turns 18 years of NQ and ES futures data into clean,
                conditional probabilities. Every edge is shown against its
                baseline, with the sample size in plain sight — so you know
                exactly how strong a setup really is.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mt-6">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-brand text-base font-semibold text-on-brand hover:bg-brand-hover transition-colors"
                >
                  Start free 7-day trial
                </Link>
                <a
                  href="#proof"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md border border-border-strong text-base font-semibold text-foreground hover:bg-card transition-colors"
                >
                  See the data
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>

              {/* Meta check items */}
              <div className="flex flex-wrap gap-5 mt-6 text-sm text-subtle">
                <span className="inline-flex items-center gap-2">
                  <Check size={15} className="text-up" aria-hidden="true" />
                  No card required
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check size={15} className="text-up" aria-hidden="true" />
                  Cancel anytime
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check size={15} className="text-up" aria-hidden="true" />
                  Updated daily after the close
                </span>
              </div>
            </div>

            {/* Right: sample stat preview card */}
            <div
              className="rounded-xl border border-border bg-card p-6 shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
              aria-label="Sample statistic preview"
            >
              {/* Card top */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="text-base font-semibold text-foreground">
                    Gap-up continuation — NQ
                  </div>
                  <div className="text-xs text-subtle mt-[2px]">
                    P(close above open | gap &gt; 0.30%) · RTH session
                  </div>
                </div>
                {/* Tier badge — outline style */}
                <span className="inline-flex items-center gap-1 px-3 py-[5px] rounded-full text-xs font-semibold border border-border bg-surface-2 text-muted-foreground flex-shrink-0">
                  Tier 1
                </span>
              </div>

              {/* Big value row */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-[3rem] font-bold leading-none font-mono tabular-nums text-up">
                  63.4%
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-[5px] rounded-full text-xs font-semibold bg-up-soft text-up border border-transparent">
                  <ChevronUp size={12} aria-hidden="true" />
                  +9.8 pts edge
                </span>
              </div>

              {/* Baseline */}
              <div className="text-sm text-muted-foreground">
                Baseline (all sessions):{" "}
                <span className="font-mono tabular-nums">53.6%</span>
                {" · "}
                <span className="font-mono tabular-nums">N = 1,284</span>
              </div>

              {/* Preview rows */}
              <div className="mt-5 border-t border-border">
                {/* Row 1 */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-3 border-b border-border text-sm">
                  <span className="text-muted-foreground">Monday open</span>
                  <span className="font-semibold font-mono tabular-nums text-up">
                    67.1%
                  </span>
                  <span className="text-xs text-subtle font-mono tabular-nums">
                    N = 251
                  </span>
                </div>
                {/* Row 2 */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-3 border-b border-border text-sm">
                  <span className="text-muted-foreground">Gap &gt; 0.75%</span>
                  <span className="font-semibold font-mono tabular-nums text-up">
                    71.5%
                  </span>
                  <span className="text-xs text-subtle font-mono tabular-nums">
                    N = 388
                  </span>
                </div>
                {/* Row 3 */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-3 border-b border-border text-sm">
                  <span className="text-muted-foreground">Friday open</span>
                  <span className="font-semibold font-mono tabular-nums text-down">
                    48.9%
                  </span>
                  <span className="text-xs text-subtle font-mono tabular-nums">
                    N = 243
                  </span>
                </div>
                {/* Row 4 */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-3 border-b border-border text-sm">
                  <span className="text-muted-foreground">FOMC day</span>
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
              Coverage across the instruments you actually trade
            </p>
            <div
              className="flex flex-wrap justify-center gap-12 text-subtle font-semibold text-lg"
              aria-label="Covered instruments"
            >
              <span className="opacity-70">NQ · Nasdaq-100</span>
              <span className="opacity-70">ES · S&amp;P 500</span>
              <span className="opacity-70">RTH &amp; ETH sessions</span>
              <span className="opacity-70">2007 – present</span>
              <span className="opacity-70">1m · 5m · daily</span>
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
                Why Augur
              </span>
              <h2 className="text-[2.25rem] font-bold tracking-tight text-foreground">
                Edges you can actually trust
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-[1.55]">
                No black boxes, no curve-fit signals. Just transparent
                conditional statistics with the context you need to size a trade
                with confidence.
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
                  Baseline-relative edges
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  Every probability is shown next to its unconditional baseline.
                  A 56% hit rate means nothing until you know the base rate — we
                  put both side by side, always.
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
                  Sliced every way
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  Drill into any stat by weekday, gap size, prior-day range,
                  session, or volatility regime. Each slice carries its own
                  sample size so thin buckets never mislead you.
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
                  Refreshed daily
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  Stats recompute automatically after each cash close, rolling
                  in the latest session so your edges reflect this week&apos;s
                  market — not a backtest frozen in 2019.
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
                  Significance built in
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  Confidence intervals and minimum-N thresholds keep noise out
                  of the headline number. We grey out edges that aren&apos;t
                  statistically meaningful instead of overselling them.
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
                How it works
              </span>
              <h2 className="text-[2.25rem] font-bold tracking-tight text-foreground">
                From signup to your first edge in minutes
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
                  Pick your plan
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  Choose a tier from Starter to Enterprise. Higher tiers unlock
                  deeper stat families and finer slices. Start free for 7 days,
                  no card required.
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
                  Browse the stat catalog
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  Open the dashboard and explore stat families for NQ and ES —
                  gaps, opening drives, range extensions, weekday seasonality
                  and more. Filter to what fits your style.
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
                  Trade with context
                </h3>
                <p className="text-sm text-muted-foreground leading-[1.55]">
                  Read the edge against its baseline, check the sample size, and
                  size your position accordingly. Come back after the close for
                  the next day&apos;s refreshed numbers.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* ===================================================================
            SOCIAL PROOF — metrics + testimonials
            =================================================================== */}
        <section className="py-24" id="proof">
          <div className={container}>
            {/* Metrics row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 text-center">
              <div>
                <div className="text-[3rem] font-bold tracking-tight font-mono tabular-nums text-foreground">
                  54+
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Distinct stat families
                </div>
              </div>
              <div>
                <div className="text-[3rem] font-bold tracking-tight font-mono tabular-nums text-foreground">
                  1.2M
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Data points analyzed
                </div>
              </div>
              <div>
                <div className="text-[3rem] font-bold tracking-tight font-mono tabular-nums text-foreground">
                  18 yrs
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Of NQ &amp; ES history
                </div>
              </div>
              <div>
                <div className="text-[3rem] font-bold tracking-tight font-mono tabular-nums text-foreground">
                  2
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Covered instruments (NQ &amp; ES)
                </div>
              </div>
            </div>

            {/* Section head */}
            <div className="max-w-[640px] mx-auto mt-24 mb-12 text-center">
              <span className="inline-block text-sm font-semibold tracking-[0.06em] uppercase text-brand mb-3">
                Loved by serious traders
              </span>
              <h2 className="text-[2.25rem] font-bold tracking-tight text-foreground">
                The edge desk traders keep open all day
              </h2>
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-3 gap-5">
              {/* Testimonial 1 */}
              <figure className="rounded-xl border border-border bg-card p-6">
                <blockquote className="text-base text-foreground leading-[1.55]">
                  &ldquo;I stopped guessing whether a gap would fill. Augur
                  tells me the continuation rate by gap size and weekday, with
                  the N right there. It&apos;s the first thing I check before
                  the open.&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3 mt-5">
                  <span
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-[#06b6d4] grid place-items-center text-sm font-bold text-on-brand flex-shrink-0"
                    aria-hidden="true"
                  >
                    MK
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      Marcus Kellner
                    </span>
                    <span className="text-xs text-subtle">
                      Independent NQ futures trader
                    </span>
                  </span>
                </figcaption>
              </figure>

              {/* Testimonial 2 */}
              <figure className="rounded-xl border border-border bg-card p-6">
                <blockquote className="text-base text-foreground leading-[1.55]">
                  &ldquo;What sold me was the honesty. When a slice has 22
                  samples it says so and greys out the edge. No other stats
                  product respects significance like this.&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3 mt-5">
                  <span
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-[#06b6d4] grid place-items-center text-sm font-bold text-on-brand flex-shrink-0"
                    aria-hidden="true"
                  >
                    PD
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      Priya Desai
                    </span>
                    <span className="text-xs text-subtle">
                      Quant analyst, prop desk
                    </span>
                  </span>
                </figcaption>
              </figure>

              {/* Testimonial 3 */}
              <figure className="rounded-xl border border-border bg-card p-6">
                <blockquote className="text-base text-foreground leading-[1.55]">
                  &ldquo;We use the Enterprise API to feed our pre-market
                  checklist for a small ES book. Daily refresh and clean
                  baselines saved us weeks of building this ourselves.&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3 mt-5">
                  <span
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-[#06b6d4] grid place-items-center text-sm font-bold text-on-brand flex-shrink-0"
                    aria-hidden="true"
                  >
                    JR
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      Jonas Reuter
                    </span>
                    <span className="text-xs text-subtle">
                      Head of trading, proprietary fund
                    </span>
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ===================================================================
            CTA BAND — newsletter
            =================================================================== */}
        <section className="py-24">
          <div className={container}>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-[radial-gradient(80%_120%_at_50%_0%,rgba(14,165,233,0.18),transparent_60%),var(--card)] px-[3rem] py-[4rem] text-center">
              <h2 className="text-[2.25rem] font-bold tracking-tight text-foreground">
                Get an edge in your inbox every morning
              </h2>
              <p className="mt-4 mx-auto max-w-[32rem] text-muted-foreground leading-[1.55]">
                The Augur Pre-Market Brief: three statistically notable setups
                for NQ and ES, delivered before the open. Free, and a taste of
                the full platform.
              </p>

              {/* Single sign-up CTA — newsletter backend not built yet */}
              <div className="mt-6 flex justify-center">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-brand text-base font-semibold text-on-brand hover:bg-brand-hover transition-colors"
                >
                  Start free 7-day trial
                </Link>
              </div>

              <p className="mt-4 text-xs text-subtle">
                Free for 7 days. No card required.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
