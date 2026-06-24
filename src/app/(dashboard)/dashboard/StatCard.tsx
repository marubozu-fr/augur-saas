import Link from "next/link";
import { BarChart3, ArrowRight, Lock } from "lucide-react";
import type { StatFamilyMeta, TimeframeMeta } from "@/types/stats";

interface StatCardProps {
  family: StatFamilyMeta;
  // All timeframes of the active instrument for this family — the card
  // represents the whole family (its link points at /stats/{family}), so it
  // aggregates across timeframes rather than surfacing a single one.
  timeframes: TimeframeMeta[];
  tier: number;
  locked: boolean;
}

export function StatCard({ family, timeframes, tier, locked }: StatCardProps) {
  // timeframes is guaranteed non-empty (StatCatalog skips families with no
  // matching timeframe), so [0] is safe for the shared instrument code.
  const instrument = timeframes[0].instrument;
  const timeframeLabel = timeframes.map((t) => t.timeframe).join(" · ");
  const totalSamples = timeframes.reduce((sum, t) => sum + t.totalSamples, 0);
  const n = totalSamples.toLocaleString("en-US");

  return (
    <article
      className={[
        "relative flex flex-col gap-4 rounded-xl border bg-card p-5 overflow-hidden",
        locked
          ? "border-dashed border-border-strong"
          : "border-border hover:border-border-strong hover:-translate-y-0.5 transition-all duration-[180ms]",
      ].join(" ")}
    >
      {/* Card body — blurred/dimmed when locked */}
      <div
        className={
          locked ? "blur-[3px] opacity-50 pointer-events-none select-none" : undefined
        }
      >
        {/* Top row: icon + tier badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <span
            className="inline-grid place-items-center w-10 h-10 rounded-md bg-surface-2 text-muted-foreground flex-shrink-0"
            aria-hidden="true"
          >
            <BarChart3 size={20} />
          </span>
          <span className="inline-flex items-center px-3 py-[5px] rounded-full text-xs font-semibold border border-border bg-surface-2 text-muted-foreground flex-shrink-0">
            Tier {tier}
          </span>
        </div>

        {/* Title + instrument · timeframe */}
        <div className="mb-3">
          <h3 className="text-base font-semibold text-foreground leading-snug">
            {family.title.en}
          </h3>
          <p className="text-xs text-subtle font-mono mt-0.5">
            {instrument} · {timeframeLabel}
          </p>
        </div>

        {/* Definition */}
        <p className="text-sm text-muted-foreground leading-normal line-clamp-3">
          {family.definition.en}
        </p>

        {/* Footer: sample size + CTA */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-border">
          <span className="text-xs text-subtle font-mono tabular-nums">
            N = {n}
          </span>
          {!locked && (
            <Link
              href={`/stats/${family.family}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:gap-2 transition-all duration-[180ms]"
            >
              View stats
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      {/* Lock overlay — rendered on top of blurred body */}
      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-5 bg-card/55 backdrop-blur-[1px]">
          <span className="inline-grid place-items-center w-10 h-10 rounded-full bg-surface-2 border border-border-strong text-muted-foreground">
            <Lock size={20} aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-foreground">
            Upgrade to unlock
          </span>
          <span className="text-xs text-muted-foreground max-w-[16rem]">
            This stat family requires a higher plan. Upgrade to access it.
          </span>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center h-8 px-4 rounded-md bg-brand text-xs font-semibold text-on-brand hover:bg-brand-hover transition-colors"
          >
            Upgrade
          </Link>
        </div>
      )}
    </article>
  );
}
