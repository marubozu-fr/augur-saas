import Link from "next/link";
import { resetPassword } from "@/app/(auth)/actions";

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string; sent?: string; email?: string }>;
}

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const { error, sent, email } = await searchParams;

  if (sent === "1") {
    return (
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-3">Check your inbox</h1>
        <p className="text-sm text-muted-foreground mb-6">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a
          password reset link. It expires in 60 minutes.
        </p>
        <Link
          href="/sign-in"
          className="text-sm font-medium text-foreground hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-center mb-2">Reset password</h1>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {error && (
        <p className="mb-4 text-sm text-destructive text-center">{error}</p>
      )}

      <form action={resetPassword} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          className="h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Send reset link
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/sign-in" className="font-medium text-foreground hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
