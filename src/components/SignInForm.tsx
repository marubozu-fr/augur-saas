"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signIn } from "@/app/(auth)/actions";
import { Checkbox } from "@/components/ui/checkbox";

interface SignInFormProps {
  error?: string;
}

export function SignInForm({ error }: SignInFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await signIn(formData);
    });
  }

  return (
    <>
      {error && <p className="mb-4 text-sm text-down text-center">{error}</p>}

      {/* Email/password form */}
      <form action={handleSubmit} className="grid gap-5">
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
            disabled={isPending}
            className="w-full h-11 px-4 text-sm text-foreground bg-background border border-border-strong rounded-md placeholder:text-subtle transition-colors hover:border-neutral focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand-ring disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-foreground"
            >
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
            disabled={isPending}
            className="w-full h-11 px-4 text-sm text-foreground bg-background border border-border-strong rounded-md placeholder:text-subtle transition-colors hover:border-neutral focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand-ring disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {/* .checkbox-row: Keep me signed in — checked by default, submits as name="remember" */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Checkbox
            id="remember"
            name="remember"
            defaultChecked
            disabled={isPending}
          />
          <label htmlFor="remember" className="cursor-pointer select-none">
            Keep me signed in
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center w-full h-11 rounded-md bg-brand text-on-brand text-sm font-semibold hover:bg-brand-hover active:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </button>
      </form>
    </>
  );
}
