"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface TimeframeSelectorProps {
  timeframes: string[];
  activeTimeframe: string;
}

export function TimeframeSelector({
  timeframes,
  activeTimeframe,
}: TimeframeSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(tf: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("timeframe", tf);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      role="tablist"
      aria-label="Timeframe"
      className="inline-flex p-[3px] gap-[2px] rounded-md border border-border bg-card"
    >
      {timeframes.map((tf) => {
        const isActive = tf === activeTimeframe;
        return (
          <button
            key={tf}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(tf)}
            className={[
              "px-3 h-7 rounded-[calc(var(--radius-md)-2px)] font-mono text-xs font-semibold tracking-wide transition-colors",
              isActive
                ? "bg-brand text-on-brand"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tf.charAt(0).toUpperCase() + tf.slice(1).toLowerCase()}
          </button>
        );
      })}
    </div>
  );
}
