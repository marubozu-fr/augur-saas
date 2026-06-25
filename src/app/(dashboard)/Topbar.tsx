interface TopbarProps {
  userTier: number | null;
  /** Page title shown in the top bar. Defaults to "Stat catalog". */
  title?: string;
}

export function Topbar({ userTier, title = "Stat catalog" }: TopbarProps) {
  const tierLabel = userTier !== null ? `Tier ${userTier}` : "No active plan";

  return (
    <header className="sticky top-0 z-40 flex items-center gap-4 h-16 px-6 bg-background/80 backdrop-saturate-[160%] backdrop-blur-[12px] border-b border-border">
      <span className="text-base font-semibold text-foreground">
        {title}
      </span>

      <div className="flex-1" />

      {/* Subscription tier pill */}
      <span
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-semibold"
        title="Your current subscription tier"
      >
        <span
          className="w-2 h-2 rounded-full bg-brand shadow-[0_0_0_3px_rgba(14,165,233,0.14)] flex-shrink-0"
          aria-hidden="true"
        />
        <span className="text-muted-foreground">Plan</span>
        <span className="text-foreground">{tierLabel}</span>
      </span>
    </header>
  );
}
