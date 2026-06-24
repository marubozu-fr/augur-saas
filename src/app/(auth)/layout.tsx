import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AugurLogo } from "@/components/AugurLogo";

// Shared layout for all auth routes: /sign-in, /sign-up, /forgot-password.
// Renders a centered card on an ambient-glow dark background, matching
// docs/mockups/auth.html (.auth-page shell + .auth-brand + ambient ::before glow).
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5 py-12 overflow-hidden bg-background">
      {/* Ambient sky glow — mirrors .auth-page::before in the mockup */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(55%_55%_at_50%_0%,rgba(14,165,233,0.18),transparent_70%)]"
        aria-hidden="true"
      />

      {/* Back to home — shared across all auth routes (sign-in, sign-up, forgot-password) */}
      <div className="relative z-10 self-start mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>
      </div>

      {/* Brand mark — larger version matching .auth-brand in the mockup */}
      <div className="relative z-10 mb-6">
        <AugurLogo />
      </div>

      {/* Page content (the card) */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
