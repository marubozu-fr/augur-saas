// Accordion item for a single slice dimension (e.g. "Day of week").
// Uses native <details>/<summary> for zero-JS server rendering.
// The chevron rotation on open is handled by the .accordion-chev CSS rule
// in globals.css (details[open] > summary .accordion-chev).

import { useTranslations } from "next-intl";
import type { SliceResult } from "@/types/stats";
import type { LabelResolver } from "./helpers";
import { ProbabilityTable } from "./ProbabilityTable";
import type { TableRow } from "./ProbabilityTable";
import { pickLocale } from "@/lib/i18n/pick";
import type { Locale } from "@/i18n/config";

interface SliceAccordionProps {
  slice: SliceResult;
  resolver: LabelResolver;
  locale: Locale;
}

export function SliceAccordion({
  slice,
  resolver,
  locale,
}: SliceAccordionProps) {
  const t = useTranslations("statDetail");
  const groups = Object.entries(slice.groups);
  const groupCount = groups.length;

  // Flatten all rows from all groups, tagging each with its group label.
  // Skip magnitude sentinels (probability === 0 && value != null) — those
  // belong in the MagnitudeCards section, not in probability tables.
  const rows: TableRow[] = [];
  for (const [, group] of groups) {
    for (const row of group.results) {
      if (row.probability === 0 && row.value != null) continue;
      rows.push({ row, group: pickLocale(group.label, locale) });
    }
  }

  // Resolve the dimension code to a human-readable label for the summary header.
  const dimensionLabel = resolver.dimension(slice.dimension);

  // Range shown in the collapsed summary (e.g. "Monday – Friday")
  const firstGroup = groups[0]?.[1];
  const lastGroup = groups[groups.length - 1]?.[1];
  const summaryRange =
    firstGroup && lastGroup && groupCount > 1
      ? `${pickLocale(firstGroup.label, locale)} – ${pickLocale(lastGroup.label, locale)}`
      : firstGroup
        ? pickLocale(firstGroup.label, locale)
        : "";

  return (
    <details className="accordion-item border border-border rounded-xl bg-card overflow-hidden">
      <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer list-none font-semibold text-sm hover:bg-surface-2 transition-colors [&::-webkit-details-marker]:hidden">
        {/* Chevron — .accordion-chev rotates 90° when details[open] via globals.css */}
        <svg
          className="accordion-chev flex-shrink-0 text-subtle transition-transform"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
        {dimensionLabel}
        <span className="ml-auto flex items-center gap-3 font-medium text-subtle text-xs">
          {t.rich("groupCount", {
            count: groupCount,
            mono: (chunks) => (
              <span className="font-mono tabular-nums">{chunks}</span>
            ),
          })}
          {summaryRange && (
            <>
              <span aria-hidden="true">·</span>
              {summaryRange}
            </>
          )}
        </span>
      </summary>

      <div className="border-t border-border">
        {rows.length === 0 ? (
          <div className="flex items-center gap-3 px-5 py-4 text-sm text-muted-foreground">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="text-subtle flex-shrink-0"
            >
              <rect x="4" y="11" width="16" height="9" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            {t("noDataForSlice")}
          </div>
        ) : (
          <ProbabilityTable
            rows={rows}
            resolver={resolver}
            headBg="bg-background"
          />
        )}
      </div>
    </details>
  );
}
