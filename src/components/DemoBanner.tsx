import { getFormatter, getTranslations } from "next-intl/server";
import { getSnapshotDataEnd } from "@/services/augur-snapshot";
import { AUGUR_SAAS_REPO_URL } from "@/lib/constants";

// Full-width strip announcing demo mode, rendered by the root layout at the
// top of <body> — see src/app/layout.tsx. Callers are responsible for the
// isDemoMode() check; this component assumes it is always demo mode.
//
// Deliberately in normal document flow (no `sticky`/`fixed`): it must not
// cover — or be covered by — the marketing header, the dashboard sidebar, or
// any other `sticky top-0` chrome. Since those elements resolve their sticky
// offset relative to the viewport, and this banner renders before them in
// the document, they only start sticking once the banner has already
// scrolled out of view — no explicit offset math needed here.
export async function DemoBanner() {
  const t = await getTranslations("demo.banner");
  const format = await getFormatter();
  const dataEnd = await getSnapshotDataEnd();
  const formattedDate = format.dateTime(new Date(`${dataEnd}T00:00:00Z`), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="w-full border-b border-border bg-muted px-6 py-2 text-center text-xs text-muted-foreground">
      {t("text", { date: formattedDate })}{" "}
      <a
        href={AUGUR_SAAS_REPO_URL}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-foreground underline underline-offset-2 hover:text-brand transition-colors"
      >
        {t("sourceCode")}
      </a>
    </div>
  );
}
