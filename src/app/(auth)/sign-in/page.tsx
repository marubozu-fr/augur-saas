import Link from "next/link";
import { signIn } from "@/app/(auth)/actions";
import { OAuthButtons } from "@/components/OAuthButtons";
import { Checkbox } from "@/components/ui/checkbox";

interface SignInPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error } = await searchParams;

  return (
    // .auth-card: surface background, border, rounded-xl, padding, shadow
    <div className="w-full bg-card border border-border rounded-xl p-8 shadow-[0_16px_48px_rgba(0,0,0,0.55)]">
      {/* .auth-card__head */}
      <div className="text-center mb-8">
        <h1 className="text-[1.75rem] font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to access your stat catalog.
        </p>
      </div>

      {/* OAuth providers */}
      <OAuthButtons />

      {/* "or continue with email" separator */}
      <div className="flex items-center gap-4 my-6 text-xs tracking-widest uppercase text-subtle before:flex-1 before:h-px before:bg-border after:flex-1 after:h-px after:bg-border">
        or continue with email
      </div>

      {error && (
        <p className="mb-4 text-sm text-down text-center">{error}</p>
      )}

      {/* Email/password form */}
      <form action={signIn} className="grid gap-5">
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
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="password" className="text-sm font-semibold text-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-brand hover:text-brand-hover transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="w-full h-11 px-4 text-sm text-foreground bg-background border border-border-strong rounded-md placeholder:text-subtle transition-colors hover:border-neutral focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand-ring"
          />
        </div>

        {/* .checkbox-row: Keep me signed in — checked by default, submits as name="remember" */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Checkbox
            id="remember"
            name="remember"
            defaultChecked
          />
          <label htmlFor="remember" className="cursor-pointer select-none">
            Keep me signed in
          </label>
        </div>

        <button
          type="submit"
          className="w-full h-11 rounded-md bg-brand text-on-brand text-sm font-semibold hover:bg-brand-hover active:bg-brand-hover transition-colors"
        >
          Sign in
        </button>
      </form>

      {/* .auth-foot */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-brand hover:text-brand-hover transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
