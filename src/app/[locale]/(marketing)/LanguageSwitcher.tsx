"use client";

// Public marketing language switcher (issue #114 mockup:
// docs/mockups/language-switcher.html). Desktop renders a DropdownMenu
// between the nav links and the Sign in / Get started CTAs; mobile renders
// the same options as full-width rows inside the existing inline mobile menu
// area (there is no Sheet/drawer in this header to embed into).
//
// Each option links to the SAME page in the other locale (next-intl Link,
// locale-aware) and also persists the choice into the NEXT_LOCALE cookie so
// it carries over once the visitor reaches the cookie-driven private app.

import { Globe, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/config";
import { setLocaleCookie } from "@/lib/i18n/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

export function LanguageSwitcherDesktop() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("changeLanguage", { language: LOCALE_NAMES[locale] })}
          className="inline-flex items-center gap-2 h-10 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
        >
          <Globe size={16} aria-hidden="true" />
          <span className="font-mono text-xs font-semibold uppercase">
            {locale}
          </span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((option) => {
          const isActive = option === locale;
          return (
            // Highlight styles must sit on the item, not on the Link: only
            // DropdownMenuItem runs them through cn()/tailwind-merge, which
            // drops the base focus:bg-accent (invisible — it equals the popover
            // background). Radix's Slot would merely concatenate them onto the
            // Link, leaving focus:bg-accent to win on specificity. Radix
            // highlights via focus, so focus: covers hover and arrow keys both.
            <DropdownMenuItem
              key={option}
              asChild
              className={
                isActive
                  ? "bg-brand-soft text-brand focus:bg-brand-soft-strong focus:text-brand"
                  : "text-foreground focus:bg-card focus:text-foreground"
              }
            >
              <Link
                href={pathname}
                locale={option}
                aria-current={isActive ? "true" : undefined}
                onClick={() => {
                  void setLocaleCookie(option);
                }}
              >
                <span className="flex-1">{LOCALE_NAMES[option]}</span>
                <span className="font-mono text-xs font-semibold uppercase text-subtle">
                  {option}
                </span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact disclosure for the mobile header row (this header has no Sheet/drawer
// to embed into). A native <details> keeps the trigger inline next to the CTAs
// so the language options no longer occupy permanent above-the-fold space.
export function LanguageSwitcherMobile() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <details className="relative">
      <summary
        aria-label={t("changeLanguage", { language: LOCALE_NAMES[locale] })}
        className="list-none inline-flex items-center gap-1.5 h-10 px-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground transition-colors cursor-pointer [&::-webkit-details-marker]:hidden"
      >
        <Globe size={16} aria-hidden="true" />
        <span className="font-mono text-xs font-semibold uppercase">
          {locale}
        </span>
        <ChevronDown size={14} aria-hidden="true" />
      </summary>
      <div className="absolute right-0 z-50 mt-1 min-w-[11rem] rounded-md border border-border bg-popover p-1 shadow-md">
        {locales.map((option) => {
          const isActive = option === locale;
          return (
            <Link
              key={option}
              href={pathname}
              locale={option}
              aria-current={isActive ? "true" : undefined}
              onClick={() => {
                void setLocaleCookie(option);
              }}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-soft text-brand hover:bg-brand-soft-strong"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              <span className="flex-1">{LOCALE_NAMES[option]}</span>
              <span className="font-mono text-xs font-semibold uppercase text-subtle">
                {option}
              </span>
            </Link>
          );
        })}
      </div>
    </details>
  );
}
