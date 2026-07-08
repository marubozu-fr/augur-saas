"use client";

// LanguageSelect — client component for the Profile settings card.
// Immediate save on change (no submit button), mirroring the inline
// email-change affordance elsewhere in the same card. "Auto (browser)" clears
// the stored preference (falls back to cookie / Accept-Language detection);
// "English" / "Français" pin a locale. See docs/mockups/account.html.

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLocalePreference } from "./actions";
import type { Locale } from "@/i18n/config";

interface LanguageSelectProps {
  preferredLocale: Locale | null;
}

// "auto" is a UI-only sentinel — the server action receives null for it.
type SelectValueOption = "auto" | Locale;

export function LanguageSelect({ preferredLocale }: LanguageSelectProps) {
  const t = useTranslations("account");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const value: SelectValueOption = preferredLocale ?? "auto";

  function handleChange(next: string) {
    const locale = next === "auto" ? null : (next as Locale);
    startTransition(async () => {
      const result = await updateLocalePreference(locale);
      if (!result.error) {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 mt-5">
      <label
        htmlFor="lang-pref"
        className="text-sm font-semibold text-foreground"
      >
        {t("language.label")}
      </label>
      <Select value={value} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger id="lang-pref" className="w-full max-w-[20rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">{t("language.auto")}</SelectItem>
          <SelectItem value="en">{t("language.english")}</SelectItem>
          <SelectItem value="fr">{t("language.french")}</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-subtle">{t("language.hint")}</p>
    </div>
  );
}
