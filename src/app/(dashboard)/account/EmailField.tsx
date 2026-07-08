"use client";

// EmailField — client component.
// Shows the current email read-only. A "Change" button reveals an input +
// submit field. On submit calls the changeEmail server action and surfaces
// success / error feedback inline.

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { changeEmail } from "./actions";

interface EmailFieldProps {
  currentEmail: string;
}

export function EmailField({ currentEmail }: EmailFieldProps) {
  const t = useTranslations("account.profile");
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleEdit() {
    setEditing(true);
    setFeedback(null);
  }

  function handleCancel() {
    setEditing(false);
    setFeedback(null);
  }

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await changeEmail(formData);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setEditing(false);
        setFeedback({
          type: "success",
          message: t("emailChangeConfirmationSent"),
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="current-email"
        className="text-sm font-semibold text-foreground"
      >
        {t("emailAddress")}
      </label>

      {!editing ? (
        <>
          <div className="flex items-center gap-3">
            <input
              id="current-email"
              type="email"
              value={currentEmail}
              readOnly
              aria-describedby="email-hint"
              className="w-full h-10 px-4 text-sm text-muted-foreground bg-surface-2 border border-border rounded-md cursor-default"
            />
            <button
              type="button"
              onClick={handleEdit}
              className="flex-shrink-0 h-10 px-4 rounded-md border border-border-strong text-sm font-semibold text-foreground hover:bg-surface-2 transition-colors"
            >
              {t("change")}
            </button>
          </div>
          <p id="email-hint" className="text-xs text-subtle">
            {t("emailChangeHint")}
          </p>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <input
              id="current-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={currentEmail}
              className="w-full h-10 px-4 text-sm text-foreground bg-surface-2 border border-border rounded-md placeholder:text-subtle transition-colors hover:border-border-strong focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand-ring"
            />
            <button
              type="submit"
              disabled={isPending}
              className="flex-shrink-0 h-10 px-4 rounded-md bg-brand text-sm font-semibold text-on-brand hover:bg-brand-hover transition-colors disabled:opacity-60"
            >
              {isPending ? t("saving") : t("save")}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-shrink-0 h-10 px-4 rounded-md border border-border text-sm font-semibold text-muted-foreground hover:bg-surface-2 transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
          <p className="text-xs text-subtle">{t("emailChangeHint")}</p>
        </form>
      )}

      {feedback && (
        <p
          className={`text-xs ${
            feedback.type === "error" ? "text-down" : "text-up"
          }`}
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}
