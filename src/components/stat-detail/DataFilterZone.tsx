// Data filter zone — lighter surface than the context zone. Refines HOW the
// selected stat is sliced. Currently hosts the timeframe ToggleGroup; built
// to accommodate future stat-specific filters on the same row (per mockup).

"use client";

import { Info } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  if (timeframes.length === 0) return null;

  return (
    <section
      aria-label="Data filters"
      className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5 p-3 px-4 mb-5 border border-border rounded-lg bg-muted"
    >
      <div className="flex items-center gap-3">
        <span
          id="lbl-timeframe"
          className="text-xs font-semibold tracking-wider uppercase text-subtle"
        >
          Timeframe
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
              {tf.charAt(0).toUpperCase() + tf.slice(1).toLowerCase()}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <span className="md:ml-auto inline-flex items-center gap-2 text-xs text-subtle">
        <Info size={14} aria-hidden="true" />
        More filters appear here per stat family
      </span>
    </section>
  );
}
