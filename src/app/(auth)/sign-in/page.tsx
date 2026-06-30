import Link from "next/link";
import { SignInForm } from "@/components/SignInForm";

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

      <SignInForm error={error} />

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
