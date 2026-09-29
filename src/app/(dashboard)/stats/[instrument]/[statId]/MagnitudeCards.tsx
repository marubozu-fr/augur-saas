import { TrendingUp, TrendingDown } from "lucide-react";
import { useTranslations } from "next-intl";
import type { StatResultRow } from "@/types/stats";
import type { LabelResolver } from "@/lib/stat-format";
import { fmtNum } from "@/lib/stat-format";
import {
  formatMagnitude,
  formatMagnitudeInline,
  getMagnitudeUnit,
} from "@/lib/stat-units";
import type { Locale } from "@/i18n/config";

interface MagnitudeCardsProps {
  rows: StatResultRow[];
  statName: string;
  resolver: LabelResolver;
  locale: Locale;
}

export function MagnitudeCards({
  rows,
  statName,
  resolver,
  locale,
}: MagnitudeCardsProps) {
  const t = useTranslations("statDetail");
  // Only rows that carry a numeric value (the magnitude sentinel pattern)
  const magnitudeRows = rows.filter(
    (r) => r.probability === 0 && r.value != null,
  );
  if (magnitudeRows.length === 0) return null;

  return (
    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 min-[861px]:grid-cols-4 gap-4">
      {magnitudeRows.map((row, i) => {
        const unit = getMagnitudeUnit(statName, row.outcome);
        const value = formatMagnitude(row.value!, unit, locale, t);
        const hasBaseline = row.valueBaseline != null && row.baselineN > 0;
        // Bull/bear detection stays on the raw API code (stable identifiers).
        const isUp = row.outcome.toLowerCase().includes("bull");
        const isDown = row.outcome.toLowerCase().includes("bear");

        const badgeClass = isUp
          ? "bg-up-soft text-up"
          : isDown
            ? "bg-down-soft text-down"
            : "bg-surface-2 text-muted-foreground";

        const BadgeIcon = isUp ? TrendingUp : isDown ? TrendingDown : null;

        return (
          <article
            key={i}
            className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-muted-foreground">
                {resolver.condition(row.condition)} ·{" "}
                {resolver.outcome(row.outcome)}
              </span>
              {BadgeIcon && (
                <span
                  className={[
                    "inline-flex items-center gap-1 text-xs font-semibold px-3 py-[5px] rounded-full",
                    badgeClass,
                  ].join(" ")}
                >
                  <BadgeIcon size={12} aria-hidden="true" />
                  {isUp ? t("bullish") : t("bearish")}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-mono text-3xl min-[480px]:text-4xl font-bold text-foreground tabular-nums break-all min-w-0">
                {value.number}
              </span>
              {value.suffix !== null && (
                <span className="text-lg font-semibold text-muted-foreground">
                  {value.suffix}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle pt-3 border-t border-border">
              <span>
                {t.rich("nEquals", {
                  mono: (chunks) => (
                    <span className="font-mono tabular-nums">{chunks}</span>
                  ),
                  count: fmtNum(row.count, locale),
                })}
              </span>
              {hasBaseline ? (
                <span>
                  {t.rich("vsBaseline", {
                    mono: (chunks) => (
                      <span className="font-mono tabular-nums">{chunks}</span>
                    ),
                    value: formatMagnitudeInline(
                      formatMagnitude(row.valueBaseline!, unit, locale, t),
                    ),
                  })}
                </span>
              ) : (
                <span className="text-subtle">{t("noBaselineAvailable")}</span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
