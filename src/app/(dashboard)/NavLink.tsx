"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface NavLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

// Sidebar nav link for the dashboard. Highlights itself and sets
// aria-current="page" when its href matches the current route.
export function NavLink({ href, icon: Icon, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
        isActive
          ? "bg-brand-soft text-brand"
          : "text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
      }`}
    >
      <Icon size={18} aria-hidden="true" />
      {label}
    </Link>
  );
}
