import { TrendingUp, TrendingDown } from "lucide-react";
import { useTranslations } from "next-intl";
import type { StatResultRow } from "@/types/stats";
import type { LabelResolver } from "./helpers";
import { fmtValue, fmtNum } from "./helpers";

interface MagnitudeCardsProps {
  rows: StatResultRow[];
  resolver: LabelResolver;
}

export function MagnitudeCards({ rows, resolver }: MagnitudeCardsProps) {
  const t = useTranslations("statDetail");
  // Only rows that carry a numeric value (the magnitude sentinel pattern)
  const magnitudeRows = rows.filter(
    (r) => r.probability === 0 && r.value != null,
  );
  if (magnitudeRows.length === 0) return null;

  return (
    <div className="grid grid-cols-2 min-[861px]:grid-cols-4 gap-4">
      {magnitudeRows.map((row, i) => {
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
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl font-bold text-foreground tabular-nums">
                {fmtValue(row.value!)}
              </span>
              <span className="text-lg font-semibold text-muted-foreground">
                %
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-subtle pt-3 border-t border-border">
              <span>
                {t.rich("nEquals", {
                  mono: (chunks) => (
                    <span className="font-mono tabular-nums">{chunks}</span>
                  ),
                  count: fmtNum(row.count),
                })}
              </span>
              {hasBaseline ? (
                <span>
                  {t.rich("vsBaseline", {
                    mono: (chunks) => (
                      <span className="font-mono tabular-nums">{chunks}</span>
                    ),
                    value: `${fmtValue(row.valueBaseline!)}%`,
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
