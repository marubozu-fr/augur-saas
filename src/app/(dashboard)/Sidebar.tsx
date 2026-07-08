"use client";

import Link from "next/link";
import { LayoutDashboard, User, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/(auth)/actions";
import { NavLink } from "@/app/(dashboard)/NavLink";

interface SidebarProps {
  userTier: number | null;
}

export function Sidebar({ userTier }: SidebarProps) {
  const t = useTranslations("dashboard.sidebar");
  const tierLabel =
    userTier !== null ? t("tier", { tier: userTier }) : t("noPlan");

  return (
    <aside className="hidden md:flex sticky top-0 self-start h-screen flex-col gap-2 px-4 py-5 bg-muted border-r border-border">
      {/* Brand mark + wordmark */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-3 font-bold text-lg tracking-tight text-foreground px-2 pb-5"
        aria-label="Augur home"
      >
        <span
          className="w-8 h-8 rounded-md bg-gradient-to-br from-brand to-[#06b6d4] grid place-items-center text-on-brand shadow-sm flex-shrink-0"
          aria-hidden="true"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 5h12L11 12l7 7H6" />
          </svg>
        </span>
        Augur
      </Link>

      {/* Primary navigation */}
      <nav aria-label="Primary">
        <NavLink
          href="/dashboard"
          icon={LayoutDashboard}
          label={t("dashboard")}
        />
        <NavLink href="/account" icon={User} label={t("account")} />
      </nav>

      {/* Spacer pushes tier badge + logout to bottom */}
      <div className="flex-1" />

      {/* Plan/Tier badge — full-width block row, just above Logout.
          Matches mockup .tier-pill--sidebar: flex w-full, tier value pushed right. */}
      <span
        className="flex w-full items-center gap-2 px-3 py-3 rounded-lg border border-border bg-card text-xs font-semibold"
        title={t("planTooltip")}
      >
        <span
          className="w-2 h-2 rounded-full bg-brand shadow-[0_0_0_3px_rgba(14,165,233,0.14)] flex-shrink-0"
          aria-hidden="true"
        />
        <span className="text-muted-foreground">{t("plan")}</span>
        <span className="ml-auto text-foreground">{tierLabel}</span>
      </span>

      {/* Logout */}
      <nav aria-label="Session">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-down hover:bg-card transition-colors"
          >
            <LogOut size={18} aria-hidden="true" />
            {t("logout")}
          </button>
        </form>
      </nav>
    </aside>
  );
}
