import Link from "next/link";
import type { ReactNode } from "react";
import { AugurLogo } from "@/components/AugurLogo";
import { MarketingNavLink } from "./MarketingNavLink";

// Shared container class — matches .container in styles.css (max-w 1180px)
const container = "mx-auto w-full max-w-[1180px] px-6";

// Primary nav links. Section links point at landing-page anchors so they work
// from any marketing page; "/pricing" is a real route and lights up when active.
const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#proof", label: "Customers" },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
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

            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center h-10 px-4 rounded-md text-sm font-semibold text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-brand text-sm font-semibold text-on-brand hover:bg-brand-hover transition-colors"
              >
                Get started
              </Link>
            </div>
          </nav>

          {/* Mobile: Sign in + primary CTA */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center h-10 px-4 rounded-md text-sm font-semibold text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-brand text-sm font-semibold text-on-brand hover:bg-brand-hover transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {children}

      {/* =====================================================================
          FOOTER  (shared across all marketing pages)
          ===================================================================== */}
      <footer className="border-t border-border pt-16 pb-8">
        <div className={container}>
          <div className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-6">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <AugurLogo />
              <p className="mt-4 text-sm text-muted-foreground max-w-[22rem] leading-[1.55]">
                Statistical market probabilities for NQ and ES futures traders.
                Transparent edges, real baselines, refreshed daily.
              </p>
            </div>

            {/* Product column */}
            <div>
              <h4 className="text-xs font-semibold tracking-[0.06em] uppercase text-subtle mb-4">
                Product
              </h4>
              <ul className="grid gap-3 list-none">
                <li>
                  <Link
                    href="/#features"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#how"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sign-up"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Start free trial
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company column */}
            <div>
              <h4 className="text-xs font-semibold tracking-[0.06em] uppercase text-subtle mb-4">
                Company
              </h4>
              <ul className="grid gap-3 list-none">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Methodology
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Changelog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal column */}
            <div>
              <h4 className="text-xs font-semibold tracking-[0.06em] uppercase text-subtle mb-4">
                Legal
              </h4>
              <ul className="grid gap-3 list-none">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Risk disclosure
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cookie settings
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-12 pt-5 border-t border-border text-xs text-subtle">
            <span>© 2026 Augur · Marubozu FR. All rights reserved.</span>
            <span className="max-w-[52rem] leading-[1.55]">
              Augur provides historical statistical information only and is not
              investment advice. Past performance does not guarantee future
              results. Trading futures carries substantial risk of loss.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
