import Link from "next/link";
import { resetPassword } from "@/app/(auth)/actions";

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string; sent?: string; email?: string }>;
}

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const { error, sent, email } = await searchParams;

  // Success state — "email sent" (.auth-card .auth-success in the mockup)
  if (sent === "1") {
    return (
      <div className="w-full bg-card border border-border rounded-xl p-8 shadow-[0_16px_48px_rgba(0,0,0,0.55)] text-center">
        {/* .auth-success__icon */}
        <span
          className="inline-grid place-items-center w-14 h-14 rounded-full bg-up-soft text-up mb-5"
          aria-hidden="true"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6l8 5 8-5" />
            <rect x="3" y="5" width="18" height="14" rx="2" />
          </svg>
        </span>

        <h2 className="text-[1.375rem] font-bold tracking-tight text-foreground">
          Check your inbox
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-normal">
          If an account exists for{" "}
          <strong className="text-foreground font-mono">{email}</strong>,
          we&apos;ve sent a password reset link. It expires in 60 minutes.
        </p>

        {/* Resend + back buttons */}
        <div className="grid gap-3 mt-8">
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center w-full h-11 rounded-md border border-border-strong bg-transparent text-foreground text-sm font-semibold hover:bg-card transition-colors"
          >
            Resend email
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center w-full h-11 rounded-md bg-transparent text-muted-foreground text-sm font-semibold hover:bg-card hover:text-foreground transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  // Request state — email entry form
  return (
    <div className="w-full bg-card border border-border rounded-xl p-8 shadow-[0_16px_48px_rgba(0,0,0,0.55)]">
      {/* .auth-card__head */}
      <div className="text-center mb-8">
        <h1 className="text-[1.75rem] font-bold tracking-tight text-foreground">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your account email and we&apos;ll send you a reset link.
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-down text-center">{error}</p>}

      <form action={resetPassword} className="grid gap-5">
        <div className="grid gap-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full h-11 px-4 text-sm text-foreground bg-background border border-border-strong rounded-md placeholder:text-subtle transition-colors hover:border-neutral focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand-ring"
          />
        </div>

        <button
          type="submit"
          className="w-full h-11 rounded-md bg-brand text-on-brand text-sm font-semibold hover:bg-brand-hover active:bg-brand-hover transition-colors"
        >
          Send reset link
        </button>
      </form>

      {/* .auth-foot */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-brand hover:text-brand-hover transition-colors"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
