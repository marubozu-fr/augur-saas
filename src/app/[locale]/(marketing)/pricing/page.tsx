import type { Metadata } from "next";
import NextLink from "next/link";
import { ChevronDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { buildLanguageAlternates } from "@/i18n/metadata";
import { PricingSection } from "./PricingSection";

// Shared container class — matches .container in styles.css (max-w 1180px)
const container = "mx-auto w-full max-w-[1180px] px-6";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  const t = await getTranslations({ locale, namespace: "pricing" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { languages: buildLanguageAlternates("/pricing") },
  };
}

export default async function PricingPage() {
  const t = await getTranslations("pricing");

  const FAQ_ITEMS = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    {
      question: t("faq.q4"),
      answer: t.rich("faq.a4", {
        mono: (chunks) => <span className="font-mono">{chunks}</span>,
      }),
    },
    { question: t("faq.q5"), answer: t("faq.a5") },
    { question: t("faq.q6"), answer: t("faq.a6") },
    { question: t("faq.q7"), answer: t("faq.a7") },
  ];

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
                {t("faq.eyebrow")}
              </span>
              <h2 className="text-[2.25rem] font-bold tracking-tight text-foreground">
                {t("faq.heading")}
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
                {t("closingCta.heading")}
              </h2>
              <p className="mt-4 mx-auto max-w-[32rem] text-muted-foreground leading-[1.55]">
                {t("closingCta.description")}
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <NextLink
                  href="/sign-up"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-brand text-base font-semibold text-on-brand hover:bg-brand-hover transition-colors"
                >
                  {t("closingCta.primaryCta")}
                </NextLink>
                <a
                  href="mailto:sales@example.com"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-md border border-border-strong text-base font-semibold text-foreground hover:bg-card transition-colors"
                >
                  {t("closingCta.secondaryCta")}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
