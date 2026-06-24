import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PricingSection } from "./PricingSection";

export const metadata: Metadata = {
  title: "Augur — Pricing & Plans",
  description:
    "Every plan unlocks a deeper slice of the Augur stat catalog. Start free for 7 days, no card required.",
};

// Shared container class — matches .container in styles.css (max-w 1180px)
const container = "mx-auto w-full max-w-[1180px] px-6";

export default function PricingPage() {
  return (
    <>
      <main>
        {/* PricingSection is the client island: billing toggle + plan cards + comparison table.
            Everything that needs isAnnual state lives here to keep the client boundary
            contiguous and avoid threading state through server/client boundaries. */}
        <PricingSection />

        {/* ===================================================================
            FAQ — static, Server Component
            =================================================================== */}
        <section className="py-24">
          <div className={container}>
            <div className="max-w-[640px] mx-auto mb-12 text-center">
              <span className="inline-block text-sm font-semibold tracking-[0.06em] uppercase text-brand mb-3">
                FAQ
              </span>
              <h2 className="text-[2.25rem] font-bold tracking-tight text-foreground">
                Questions, answered
              </h2>
            </div>

            <div className="max-w-[760px] mx-auto grid gap-3">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.question}
                  className="group border border-border rounded-xl bg-card open:border-border-strong transition-colors"
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-5 font-semibold text-base text-foreground [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronDown
                      size={18}
                      className="flex-shrink-0 text-subtle transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-[1.55]">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            CLOSING CTA BAND
            =================================================================== */}
        <section className="py-24">
          <div className={container}>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-[radial-gradient(80%_120%_at_50%_0%,rgba(14,165,233,0.18),transparent_60%),var(--card)] px-[3rem] py-[4rem] text-center">
              <h2 className="text-[2.25rem] font-bold tracking-tight text-foreground">
                Still deciding? Try it free for 7 days
              </h2>
              <p className="mt-4 mx-auto max-w-[32rem] text-muted-foreground leading-[1.55]">
                Full access to your chosen tier, no card required. See the edges
                against their baselines before you pay a cent.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-brand text-base font-semibold text-on-brand hover:bg-brand-hover transition-colors"
                >
                  Start free trial
                </Link>
                <a
                  href="mailto:sales@example.com"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-md border border-border-strong text-base font-semibold text-foreground hover:bg-card transition-colors"
                >
                  Talk to sales
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

interface FaqItem {
  question: string;
  answer: ReactNode;
}

// FAQ content — static, defined server-side.
const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What does a "tier" actually mean?',
    answer:
      "Each Augur stat family is graded Tier 1 to 3 by depth and conditioning complexity. Tier 1 covers headline edges like gap continuation and opening-drive direction. Tier 2 adds multi-condition slices and regime filtering. Tier 3 covers the most granular, sample-intensive studies. Your plan unlocks every stat up to and including its tier.",
  },
  {
    question: "Is there a free trial, and do I need a card?",
    answer:
      "Every paid plan starts with a 7-day free trial, and no card is required to begin. You get full access to that plan's tier during the trial. We only ask for payment details if you decide to continue after day 7.",
  },
  {
    question: "Can I change or cancel my plan later?",
    answer:
      "Yes — upgrade, downgrade, or cancel anytime from your account billing page. Upgrades take effect immediately with a prorated charge; downgrades and cancellations apply at the end of your current billing period, so you keep access until then.",
  },
  {
    question: "How does annual billing and the 20% discount work?",
    answer: (
      <>
        Switching to annual billing charges you once for twelve months at a 20%
        discount — effectively two months free. For example, Pro drops from{" "}
        <span className="font-mono">€79</span> to an effective{" "}
        <span className="font-mono">€63</span> per month (
        <span className="font-mono">€756</span> billed yearly). You can switch
        between monthly and annual whenever you like.
      </>
    ),
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Because the free trial lets you evaluate everything before paying, we don't routinely refund partial periods. That said, if something went wrong — a double charge or a billing error — email support within 14 days and we'll make it right.",
  },
  {
    question: "Which payment methods do you accept?",
    answer:
      "All payments are handled securely through Stripe. We accept major credit and debit cards. Enterprise customers can be invoiced and pay by bank transfer under an annual contract.",
  },
  {
    question: "Is Augur financial advice?",
    answer:
      "No. Augur provides historical statistical information only — it is not investment advice and not a recommendation to buy or sell any instrument. Every edge is descriptive of the past; past performance does not guarantee future results.",
  },
];
