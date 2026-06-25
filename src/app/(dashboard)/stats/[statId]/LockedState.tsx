import Link from "next/link";
import { Lock } from "lucide-react";
import type { StatRunResult } from "@/types/stats";

interface LockedStateProps {
  result: StatRunResult;
  statTier: number;
}

export function LockedState({ result, statTier }: LockedStateProps) {
  return (
    <div className="relative rounded-xl border border-dashed border-border-strong overflow-hidden">
      {/* Blurred content preview */}
      <div className="blur-[6px] opacity-40 pointer-events-none select-none p-6">
        <div className="h-8 w-48 bg-surface-2 rounded mb-4" />
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-surface-2 rounded-xl border border-border"
            />
          ))}
        </div>
        <div className="h-40 bg-surface-2 rounded-xl border border-border" />
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6 bg-card/70 backdrop-blur-[2px]">
        <span className="inline-grid place-items-center w-12 h-12 rounded-full bg-surface-2 border border-border-strong text-muted-foreground">
          <Lock size={22} aria-hidden="true" />
        </span>
        <div>
          <p className="text-base font-semibold text-foreground">
            {result.title.en}
          </p>
          <p className="mt-1 text-sm text-muted-foreground max-w-[26rem]">
            {result.definition.en}
          </p>
        </div>
        <p className="text-xs text-subtle">
          This stat requires Tier {statTier}. Your current plan does not include
          it.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center h-9 px-5 rounded-md bg-brand text-xs font-semibold text-on-brand hover:bg-brand-hover transition-colors"
        >
          Upgrade to unlock
        </Link>
      </div>
    </div>
  );
}
