import Link from "next/link";
import { signUp } from "@/app/(auth)/actions";
import { OAuthButtons } from "@/components/OAuthButtons";

interface SignUpPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { error } = await searchParams;

  return (
    // .auth-card: surface background, border, rounded-xl, padding, shadow
    <div className="w-full bg-card border border-border rounded-xl p-8 shadow-[0_16px_48px_rgba(0,0,0,0.55)]">
      {/* .auth-card__head */}
      <div className="text-center mb-8">
        <h1 className="text-[1.75rem] font-bold tracking-tight text-foreground">
          Start your free trial
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          7 days of full access. No card required.
        </p>
      </div>

      {/* OAuth providers — label matches mockup "Sign up with …" */}
      <OAuthButtons />

      {/* "or sign up with email" separator */}
      <div className="flex items-center gap-4 my-6 text-xs tracking-widest uppercase text-subtle before:flex-1 before:h-px before:bg-border after:flex-1 after:h-px after:bg-border">
        or sign up with email
      </div>

      {error && (
        <p className="mb-4 text-sm text-down text-center">{error}</p>
      )}

      {/* Email/password form */}
      <form action={signUp} className="grid gap-5">
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-semibold text-foreground">
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

        <div className="grid gap-2">
          <label htmlFor="password" className="text-sm font-semibold text-foreground">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="w-full h-11 px-4 text-sm text-foreground bg-background border border-border-strong rounded-md placeholder:text-subtle transition-colors hover:border-neutral focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand-ring"
          />
          {/* .field__hint — password strength guidance */}
          <p className="text-xs text-subtle">
            Use 8+ characters with a mix of letters, numbers &amp; symbols.
          </p>
        </div>

        <button
          type="submit"
          className="w-full h-11 rounded-md bg-brand text-on-brand text-sm font-semibold hover:bg-brand-hover active:bg-brand-hover transition-colors"
        >
          Create account
        </button>
      </form>

      {/* .auth-foot */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-brand hover:text-brand-hover transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
