import Link from "next/link";
import { LayoutDashboard, User, LogOut } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

interface SidebarProps {
  userEmail: string;
}

/** Derives two-letter initials from the email local part (e.g. "jd" → "JD"). */
function emailInitials(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0]! + parts[1][0]!).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function Sidebar({ userEmail }: SidebarProps) {
  const initials = emailInitials(userEmail);

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
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-brand-soft text-brand"
          aria-current="page"
        >
          <LayoutDashboard size={18} aria-hidden="true" />
          Dashboard
        </Link>
        <Link
          href="/account"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
        >
          <User size={18} aria-hidden="true" />
          Account
        </Link>
      </nav>

      {/* Spacer pushes logout + user card to bottom */}
      <div className="flex-1" />

      {/* Logout */}
      <nav aria-label="Session">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-down hover:bg-card transition-colors"
          >
            <LogOut size={18} aria-hidden="true" />
            Logout
          </button>
        </form>
      </nav>

      {/* User card */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
        <span
          className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-[#06b6d4] grid place-items-center text-xs font-bold text-on-brand flex-shrink-0"
          aria-hidden="true"
        >
          {initials}
        </span>
        <span className="min-w-0 leading-snug">
          <span className="block text-sm font-semibold text-foreground truncate">
            {userEmail.split("@")[0]}
          </span>
          <span className="block text-xs text-subtle truncate">{userEmail}</span>
        </span>
      </div>
    </aside>
  );
}
