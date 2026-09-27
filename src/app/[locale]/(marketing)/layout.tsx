import NextLink from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { AugurLogo } from "@/components/AugurLogo";
import { Link } from "@/i18n/navigation";
import { isDemoMode } from "@/lib/demo-mode";
import {
  AUGUR_ENGINE_REPO_URL,
  AUGUR_SAAS_LICENSE_URL,
  AUGUR_SAAS_REPO_URL,
} from "@/lib/constants";
import { MarketingNavLink } from "./MarketingNavLink";
import {
  LanguageSwitcherDesktop,
  LanguageSwitcherMobile,
} from "./LanguageSwitcher";

// Shared container class — matches .container in styles.css (max-w 1180px)
const container = "mx-auto w-full max-w-[1180px] px-6";

export default async function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const demo = isDemoMode();
  const t = await getTranslations("nav");
  const tFooter = await getTranslations("landing.footer");
  const tDemo = await getTranslations("demo");

  // Primary nav links. Section links point at landing-page anchors so they work
  // from any marketing page; "/pricing" is a real route and lights up when active.
  // Demo mode: no billing to browse, so "Pricing" is dropped (see the demo
  // header CTA below for "Sign in" / "Get started").
  const NAV_LINKS = [
    { href: "/#features", label: t("features") },
    { href: "/#how", label: t("howItWorks") },
    ...(demo ? [] : [{ href: "/pricing", label: t("pricing") }]),
  ];

  return (
    <>
      {/* =====================================================================
          HEADER / NAVIGATION  (shared across all marketing pages)
          ===================================================================== */}
      <header className="sticky top-0 z-50 h-16 flex items-center bg-background/80 backdrop-saturate-[160%] backdrop-blur-[12px] border-b border-border">
        <div className={`${container} flex items-center justify-between gap-6`}>
          <AugurLogo />

          {/* Desktop nav */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-6"
          >
            <ul className="flex items-center gap-6 list-none">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <MarketingNavLink href={link.href}>
                    {link.label}
                  </MarketingNavLink>
                </li>
              ))}
            </ul>

            {/* Secondary — language switcher, between nav links and CTAs */}
            <LanguageSwitcherDesktop />

            <div className="flex items-center gap-3">
              {/* Demo mode: no Supabase, so no sign-in — the primary CTA opens
                  the open dashboard directly instead of "/sign-up". */}
              {!demo && (
                <NextLink
                  href="/sign-in"
                  className="inline-flex items-center justify-center h-10 px-4 rounded-md text-sm font-semibold text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                >
                  {t("signIn")}
                </NextLink>
              )}
              <NextLink
                href={demo ? "/dashboard" : "/sign-up"}
                className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-brand text-sm font-semibold text-on-brand hover:bg-brand-hover transition-colors"
              >
                {demo ? tDemo("nav.openDemo") : t("getStarted")}
              </NextLink>
            </div>
          </nav>

          {/* Mobile: language toggle + Sign in + primary CTA */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcherMobile />
            {!demo && (
              <NextLink
                href="/sign-in"
                className="inline-flex items-center justify-center h-10 px-4 rounded-md text-sm font-semibold text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
              >
                {t("signIn")}
              </NextLink>
            )}
            <NextLink
              href={demo ? "/dashboard" : "/sign-up"}
              className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-brand text-sm font-semibold text-on-brand hover:bg-brand-hover transition-colors"
            >
              {demo ? tDemo("nav.openDemo") : t("getStarted")}
            </NextLink>
          </div>
        </div>
      </header>

      {children}

      {/* =====================================================================
          FOOTER  (shared across all marketing pages)
          ===================================================================== */}
      <footer className="border-t border-border pt-16 pb-8">
        <div className={container}>
          <div
            className={`grid grid-cols-2 gap-6 ${demo ? "md:grid-cols-[1.5fr_1fr_1fr]" : "md:grid-cols-[1.5fr_1fr_1fr_1fr]"}`}
          >
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <AugurLogo />
              <p className="mt-4 text-sm text-muted-foreground max-w-[22rem] leading-[1.55]">
                {tFooter("tagline")}
              </p>
            </div>

            {/* Product column */}
            <div>
              <h4 className="text-xs font-semibold tracking-[0.06em] uppercase text-subtle mb-4">
                {tFooter("productHeading")}
              </h4>
              <ul className="grid gap-3 list-none">
                <li>
                  <Link
                    href="/#features"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("features")}
                  </Link>
                </li>
                {!demo && (
                  <li>
                    <Link
                      href="/pricing"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("pricing")}
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/#how"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("howItWorks")}
                  </Link>
                </li>
                {demo ? (
                  <li>
                    <NextLink
                      href="/dashboard"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tDemo("footer.openDemo")}
                    </NextLink>
                  </li>
                ) : (
                  <li>
                    <NextLink
                      href="/sign-up"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tFooter("startTrial")}
                    </NextLink>
                  </li>
                )}
              </ul>
            </div>

            {demo ? (
              /* Project column — replaces Company + Legal in demo mode: every
                 link in those columns pointed at "#" (no about/methodology/
                 terms/privacy pages exist), so they are swapped for links to
                 the actual public repositories and license instead. */
              <div>
                <h4 className="text-xs font-semibold tracking-[0.06em] uppercase text-subtle mb-4">
                  {tDemo("footer.projectHeading")}
                </h4>
                <ul className="grid gap-3 list-none">
                  <li>
                    <a
                      href={AUGUR_SAAS_REPO_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tDemo("footer.sourceCode")}
                    </a>
                  </li>
                  <li>
                    <a
                      href={AUGUR_ENGINE_REPO_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tDemo("footer.statsEngine")}
                    </a>
                  </li>
                  <li>
                    <a
                      href={AUGUR_SAAS_LICENSE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tDemo("footer.license")}
                    </a>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                {/* Company column */}
                <div>
                  <h4 className="text-xs font-semibold tracking-[0.06em] uppercase text-subtle mb-4">
                    {tFooter("companyHeading")}
                  </h4>
                  <ul className="grid gap-3 list-none">
                    <li>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {tFooter("about")}
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {tFooter("methodology")}
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {tFooter("changelog")}
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {tFooter("contact")}
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Legal column */}
                <div>
                  <h4 className="text-xs font-semibold tracking-[0.06em] uppercase text-subtle mb-4">
                    {tFooter("legalHeading")}
                  </h4>
                  <ul className="grid gap-3 list-none">
                    <li>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {tFooter("terms")}
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {tFooter("privacy")}
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {tFooter("risk")}
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {tFooter("cookies")}
                      </a>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-12 pt-5 border-t border-border text-xs text-subtle">
            <span>
              {demo ? tDemo("footer.copyright") : tFooter("copyright")}
            </span>
            <span className="max-w-[52rem] leading-[1.55]">
              {tFooter("disclaimer")}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
