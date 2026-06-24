"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface MarketingNavLinkProps {
  href: string;
  children: ReactNode;
}

// Primary-nav link for the marketing header. Highlights itself and sets
// aria-current="page" when it targets the active route. Section links (those
// containing a hash) are never treated as active.
export function MarketingNavLink({ href, children }: MarketingNavLinkProps) {
  const pathname = usePathname();
  const isActive = !href.includes("#") && pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`text-sm font-medium transition-colors ${
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
