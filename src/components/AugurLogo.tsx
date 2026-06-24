import Link from "next/link";

// Brand mark + wordmark, linking home. Shared by the marketing header and footer.
export function AugurLogo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3 font-bold text-lg tracking-tight text-foreground"
      aria-label="Augur home"
    >
      <span
        className="w-8 h-8 rounded-md bg-gradient-to-br from-brand to-[#06b6d4] grid place-items-center text-on-brand shadow-sm flex-shrink-0"
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 5h12L11 12l7 7H6" />
        </svg>
      </span>
      Augur
    </Link>
  );
}
