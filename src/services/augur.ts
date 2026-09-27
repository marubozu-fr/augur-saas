// Server-side Augur data client.
// Import this only in Server Components, API routes, and server actions.
// NEVER import from client components — AUGUR_API_KEY is a service-level secret
// that must never reach the browser.
//
// Two data sources, selected by isDemoMode() (src/lib/demo-mode.ts):
//   - Live mode (default): fetches the live Augur API (AUGUR_API_URL/AUGUR_API_KEY).
//   - Demo mode (NEXT_PUBLIC_DEMO_MODE=true): reads the bundled snapshot in
//     demo-data/results/ via src/services/augur-snapshot.ts. AUGUR_API_URL and
//     AUGUR_API_KEY are never read in this mode. Both paths funnel through the
//     same mapper functions below — there is exactly one snake_case → camelCase
//     mapping path, not two.
//
// Functions read process.env at call time (not at module load time) so that
// `next build` does not fail when secrets are absent from the build environment.

import "server-only";

import { isDemoMode } from "@/lib/demo-mode";
import { AugurApiError } from "@/services/augur-errors";
import {
  getSnapshotResult,
  listSnapshotResults,
} from "@/services/augur-snapshot";
import type {
  RawI18nString,
  RawLabels,
  RawSliceGroupResult,
  RawSliceResult,
  RawStatFamilyMeta,
  RawStatResultRow,
  RawStatRunResult,
  RawTimeframeMeta,
  RawTimeframeResult,
} from "@/services/augur-wire";
import type {
  HealthStatus,
  I18nString,
  Labels,
  SliceGroupResult,
  SliceResult,
  StatFamilyMeta,
  StatResultRow,
  StatRunResult,
  TimeframeMeta,
  TimeframeResult,
} from "@/types/stats";

// Re-exported so existing `import { AugurApiError } from "@/services/augur"`
// call sites keep working unchanged.
export { AugurApiError } from "@/services/augur-errors";

// How long ISR caches stats data (seconds). Tune here if freshness needs change.
const STATS_REVALIDATE = 300; // 5 minutes

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

function getBaseUrl(): string {
  const url = process.env.AUGUR_API_URL;
  if (!url) {
    throw new AugurApiError("AUGUR_API_URL is not configured");
  }
  return url;
}

function getApiKey(): string {
  const key = process.env.AUGUR_API_KEY;
  if (!key) {
    throw new AugurApiError("AUGUR_API_KEY is not configured");
  }
  return key;
}

// ---------------------------------------------------------------------------
// Mapper functions (explicit, typed — no blanket deep-camelCaser)
// Dynamic map keys (instrument codes, timeframe codes, condition/outcome/dimension
// codes, slice/group keys) are passed through verbatim. Shared by both the live
// API path and the demo snapshot path below — there is no second mapping path.
// ---------------------------------------------------------------------------

function mapI18nString(raw: RawI18nString): I18nString {
  return { en: raw.en, fr: raw.fr };
}

function mapTimeframeMeta(raw: RawTimeframeMeta): TimeframeMeta {
  return {
    instrument: raw.instrument,
    timeframe: raw.timeframe,
    dataRange: raw.data_range,
    totalSamples: raw.total_samples,
  };
}

function mapStatFamilyMeta(raw: RawStatFamilyMeta): StatFamilyMeta {
  return {
    family: raw.family,
    title: mapI18nString(raw.title),
    definition: mapI18nString(raw.definition),
    timeframes: raw.timeframes.map(mapTimeframeMeta),
  };
}

function mapStatResultRow(raw: RawStatResultRow): StatResultRow {
  return {
    condition: raw.condition,
    outcome: raw.outcome,
    count: raw.count,
    total: raw.total,
    probability: raw.probability,
    baselineProb: raw.baseline_prob,
    baselineN: raw.baseline_n,
    value: raw.value,
    valueBaseline: raw.value_baseline,
  };
}

function mapSliceGroupResult(raw: RawSliceGroupResult): SliceGroupResult {
  return {
    label: mapI18nString(raw.label),
    totalSamples: raw.total_samples,
    results: raw.results.map(mapStatResultRow),
  };
}

function mapSliceResult(raw: RawSliceResult): SliceResult {
  const groups: Record<string, SliceGroupResult> = {};
  for (const [key, group] of Object.entries(raw.groups)) {
    groups[key] = mapSliceGroupResult(group);
  }
  return { dimension: raw.dimension, groups };
}

function mapTimeframeResult(raw: RawTimeframeResult): TimeframeResult {
  const slices: Record<string, SliceResult> = {};
  if (raw.slices) {
    for (const [key, slice] of Object.entries(raw.slices)) {
      slices[key] = mapSliceResult(slice);
    }
  }
  return {
    dataRange: raw.data_range,
    totalSamples: raw.total_samples,
    results: raw.results.map(mapStatResultRow),
    slices,
  };
}

function mapLabels(raw: RawLabels): Labels {
  const conditions: Record<string, I18nString> = {};
  for (const [key, val] of Object.entries(raw.conditions)) {
    conditions[key] = mapI18nString(val);
  }
  const outcomes: Record<string, I18nString> = {};
  for (const [key, val] of Object.entries(raw.outcomes)) {
    outcomes[key] = mapI18nString(val);
  }
  const dimensions: Record<string, I18nString> = {};
  if (raw.dimensions) {
    for (const [key, val] of Object.entries(raw.dimensions)) {
      dimensions[key] = mapI18nString(val);
    }
  }
  return { conditions, outcomes, dimensions };
}

function mapStatRunResult(raw: RawStatRunResult): StatRunResult {
  const instruments: Record<string, Record<string, TimeframeResult>> = {};
  for (const [instrument, timeframes] of Object.entries(raw.instruments)) {
    instruments[instrument] = {};
    for (const [timeframe, result] of Object.entries(timeframes)) {
      instruments[instrument][timeframe] = mapTimeframeResult(result);
    }
  }
  return {
    statName: raw.stat_name,
    title: mapI18nString(raw.title),
    definition: mapI18nString(raw.definition),
    labels: mapLabels(raw.labels),
    instruments,
  };
}

// Demo-mode only: builds a StatFamilyMeta straight from a snapshot file's
// parsed RawStatRunResult. The snapshot has no equivalent of the live API's
// dedicated /api/v1/stats catalog endpoint (RawStatFamilyMeta), so this
// flattens instrument → timeframe into the same flat `timeframes` array,
// reusing mapI18nString and mapTimeframeMeta above for every field — the only
// new logic is the flattening loop itself, not a second field-mapping path.
//
// `family` is passed in explicitly (the file stem, from the snapshot
// directory listing) rather than read from `raw.stat_name`: the backend's
// StatsLoader.list_families() keys families by file stem, and the file
// content should not be trusted to agree with its own file name.
function mapRunResultToFamilyMeta(
  raw: RawStatRunResult,
  family: string,
): StatFamilyMeta {
  const timeframes: TimeframeMeta[] = [];
  for (const [instrument, byTimeframe] of Object.entries(raw.instruments)) {
    for (const [timeframe, result] of Object.entries(byTimeframe)) {
      timeframes.push(
        mapTimeframeMeta({
          instrument,
          timeframe,
          data_range: result.data_range,
          total_samples: result.total_samples,
        }),
      );
    }
  }
  return {
    family,
    title: mapI18nString(raw.title),
    definition: mapI18nString(raw.definition),
    timeframes,
  };
}

// ---------------------------------------------------------------------------
// Fetch helper (live API only)
// ---------------------------------------------------------------------------

interface ApiEnvelope<T> {
  data: T | null;
  error: string | null;
}

async function fetchAugur<T>(
  endpoint: string,
  options: RequestInit,
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (cause) {
    throw new AugurApiError(
      `Network error fetching ${endpoint}: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }

  if (!response.ok) {
    throw new AugurApiError(
      `Augur API returned ${response.status} for ${endpoint}`,
      response.status,
    );
  }

  const envelope = (await response.json()) as ApiEnvelope<T>;

  if (envelope.error !== null) {
    throw new AugurApiError(
      `Augur API error on ${endpoint}: ${envelope.error}`,
    );
  }

  if (envelope.data === null) {
    throw new AugurApiError(`Augur API returned null data for ${endpoint}`);
  }

  return envelope.data;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getHealth(): Promise<HealthStatus> {
  // Demo mode has no backend to check — report healthy. Callers must hide any
  // "live API status" display in demo mode rather than surface this value.
  if (isDemoMode()) {
    return { status: "ok" };
  }
  // Public endpoint — no API key. Never cached, so it reflects live status.
  return fetchAugur<HealthStatus>("/health", { cache: "no-store" });
}

export async function getStatCatalog(): Promise<StatFamilyMeta[]> {
  if (isDemoMode()) {
    const results = await listSnapshotResults(); // already sorted by family
    return results.map(({ family, result }) =>
      mapRunResultToFamilyMeta(result, family),
    );
  }

  const apiKey = getApiKey();
  const raw = await fetchAugur<RawStatFamilyMeta[]>("/api/v1/stats", {
    headers: { "X-API-Key": apiKey },
    next: { revalidate: STATS_REVALIDATE },
  });
  return raw.map(mapStatFamilyMeta);
}

export async function getStatDetail(statId: string): Promise<StatRunResult> {
  if (isDemoMode()) {
    const raw = await getSnapshotResult(statId);
    return mapStatRunResult(raw);
  }

  const apiKey = getApiKey();
  const raw = await fetchAugur<RawStatRunResult>(
    `/api/v1/stats/${encodeURIComponent(statId)}`,
    {
      headers: { "X-API-Key": apiKey },
      next: { revalidate: STATS_REVALIDATE },
    },
  );
  return mapStatRunResult(raw);
}

// Fetches a single instrument/timeframe result, optionally date-filtered.
// The granular `/api/v1/stats/{statId}/{instrument}/{timeframe}` endpoint is
// the only one that honours `?start=&end=` — the family endpoint above ignores
// them. Date-filtered responses are NOT cached (the `end` date is typically
// today, so the data changes daily); the unfiltered variant shares the ISR TTL.
export async function getStatTimeframe(
  statId: string,
  instrument: string,
  timeframe: string,
  options?: { start?: string; end?: string },
): Promise<TimeframeResult> {
  const { start, end } = options ?? {};

  if (isDemoMode()) {
    // The snapshot has aggregates only (no per-session samples), so a period
    // label over full-history numbers would be misleading — refuse instead.
    if (start || end) {
      throw new AugurApiError(
        "Date filtering is not available in demo mode",
        400,
      );
    }
    const raw = await getSnapshotResult(statId);
    // `instrument` and `timeframe` are untrusted (URL / server-action input).
    // raw.instruments is a plain object parsed from JSON, so an object-level
    // lookup with a key like "constructor" or "__proto__" would silently
    // resolve to an inherited property instead of undefined — check ownership
    // explicitly at both levels instead of indexing directly.
    if (
      !Object.hasOwn(raw.instruments, instrument) ||
      !Object.hasOwn(raw.instruments[instrument], timeframe)
    ) {
      throw new AugurApiError(
        `Unknown instrument/timeframe: ${instrument}/${timeframe}`,
        404,
      );
    }
    const timeframeResult = raw.instruments[instrument][timeframe];
    return mapTimeframeResult(timeframeResult);
  }

  const apiKey = getApiKey();

  let endpoint = `/api/v1/stats/${encodeURIComponent(statId)}/${encodeURIComponent(instrument)}/${encodeURIComponent(timeframe)}`;
  const dateFiltered = Boolean(start && end);
  if (start && end) {
    const qs = new URLSearchParams({ start, end });
    endpoint += `?${qs.toString()}`;
  }

  const raw = await fetchAugur<RawTimeframeResult>(endpoint, {
    headers: { "X-API-Key": apiKey },
    ...(dateFiltered
      ? { cache: "no-store" }
      : { next: { revalidate: STATS_REVALIDATE } }),
  });
  return mapTimeframeResult(raw);
}
