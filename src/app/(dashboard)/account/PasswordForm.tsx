"use client";

// PasswordForm — client component.
// Change-password form with client-side validation (new === confirm, ≥ 12 chars)
// and server-action submission. Surfaces success / error feedback inline.

import { useState, useTransition } from "react";
import { changePassword } from "./actions";

export function PasswordForm() {
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Client-side validation before hitting the server action.
    if (newPassword.length < 12) {
      setFeedback({
        type: "error",
        message: "New password must be at least 12 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    startTransition(async () => {
      const result = await changePassword(formData);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Password updated." });
        (event.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-5">
      <label htmlFor="new-pw" className="text-sm font-semibold text-foreground">
        Change password
      </label>

      {/* New + confirm — side by side on wider screens */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="new-pw" className="sr-only">
            New password
          </label>
          <input
            id="new-pw"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="New password"
            className="w-full h-10 px-4 text-sm text-foreground bg-surface-2 border border-border rounded-md placeholder:text-subtle transition-colors hover:border-border-strong focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="confirm-pw" className="sr-only">
            Confirm new password
          </label>
          <input
            id="confirm-pw"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Confirm new password"
            className="w-full h-10 px-4 text-sm text-foreground bg-surface-2 border border-border rounded-md placeholder:text-subtle transition-colors hover:border-border-strong focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand-ring"
          />
        </div>
      </div>

      <p className="text-xs text-subtle">At least 12 characters.</p>

      {feedback && (
        <p
          className={`text-xs ${
            feedback.type === "error" ? "text-down" : "text-up"
          }`}
        >
          {feedback.message}
        </p>
      )}

      <div className="flex items-center gap-3 mt-3 pt-5 border-t border-border">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center h-10 px-5 rounded-md bg-brand text-sm font-semibold text-on-brand hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {isPending ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}
