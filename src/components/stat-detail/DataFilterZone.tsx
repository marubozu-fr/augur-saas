// Data filter zone — lighter surface than the context zone. Refines HOW the
// selected stat is sliced. Currently hosts the timeframe ToggleGroup; built
// to accommodate future stat-specific filters on the same row (per mockup).

"use client";

import { useTranslations } from "next-intl";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatTimeframeLabel } from "@/lib/stat-format";

interface DataFilterZoneProps {
  timeframes: string[];
  activeTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

export function DataFilterZone({
  timeframes,
  activeTimeframe,
  onTimeframeChange,
}: DataFilterZoneProps) {
  const t = useTranslations("statDetail");

  if (timeframes.length === 0) return null;

  return (
    <section
      aria-label={t("dataFiltersAriaLabel")}
      className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5 p-3 px-4 mb-5 border border-border rounded-lg bg-muted"
    >
      <div className="flex items-center gap-3">
        <span
          id="lbl-timeframe"
          className="text-xs font-semibold tracking-wider uppercase text-subtle"
        >
          {t("timeframe")}
        </span>
        <ToggleGroup
          type="single"
          value={activeTimeframe}
          onValueChange={(value) => value && onTimeframeChange(value)}
          aria-labelledby="lbl-timeframe"
          className="p-[3px] gap-[2px] rounded-md border border-border bg-card"
        >
          {timeframes.map((tf) => (
            <ToggleGroupItem
              key={tf}
              value={tf}
              className="h-7 rounded-[calc(var(--radius-md)-2px)] font-mono text-xs font-semibold tracking-wide text-muted-foreground hover:text-foreground data-[state=on]:bg-brand data-[state=on]:text-on-brand"
            >
              {formatTimeframeLabel(tf)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </section>
  );
}
