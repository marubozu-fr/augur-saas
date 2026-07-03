"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { signUp } from "@/app/(auth)/actions";

interface SignUpFormProps {
  error?: string;
}

export function SignUpForm({ error }: SignUpFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await signUp(formData);
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
          <label
            htmlFor="password"
            className="text-sm font-semibold text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            disabled={isPending}
            className="w-full h-11 px-4 text-sm text-foreground bg-background border border-border-strong rounded-md placeholder:text-subtle transition-colors hover:border-neutral focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand-ring disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {/* .field__hint — password strength guidance */}
          <p className="text-xs text-subtle">
            Use 8+ characters with a mix of letters, numbers &amp; symbols.
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center w-full h-11 rounded-md bg-brand text-on-brand text-sm font-semibold hover:bg-brand-hover active:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </>
  );
}
