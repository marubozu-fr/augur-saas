// Page title + tier badge + one-line description. Rendered from catalog
// metadata (title/definition are static per family, independent of the
// selected instrument/timeframe/period) plus the sync getStatTier() lookup,
// so it never needs to suspend — it stays visible while the period-scoped
// data section below re-fetches.
//
// DEVIATION: the current LockedState (rendered inside the data Suspense
// boundary, unchanged) also displays the stat's title/definition in its own
// overlay. Because that information is already public (LockedState reveals
// it even when locked), showing it here too is not a new information leak,
// but it does mean the title/definition render twice on a locked stat page.

import { useTranslations } from "next-intl";
import { isDemoMode } from "@/lib/demo-mode";

interface StatHeaderProps {
  title: string;
  definition: string;
  tier: number;
}

export function StatHeader({ title, definition, tier }: StatHeaderProps) {
  const t = useTranslations("statDetail");
  const demo = isDemoMode();

  return (
    <div className="flex items-start gap-5 flex-wrap mb-5">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {/* Tier badge — hidden in demo mode: there is no plan, every stat is
              unlocked. */}
          {!demo && (
            <span className="inline-flex items-center px-3 py-[5px] rounded-full text-xs font-semibold bg-brand-soft text-brand">
              {t("tier", { tier })}
            </span>
          )}
        </div>
        {definition && (
          <p className="mt-3 text-sm text-muted-foreground leading-normal">
            {definition}
          </p>
        )}
      </div>
    </div>
  );
}
