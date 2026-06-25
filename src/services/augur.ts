// Server-side Augur API client.
// Import this only in Server Components, API routes, and server actions.
// NEVER import from client components — AUGUR_API_KEY is a service-level secret
// that must never reach the browser.
//
// Functions read process.env at call time (not at module load time) so that
// `next build` does not fail when secrets are absent from the build environment.

import "server-only";

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

// How long ISR caches stats data (seconds). Tune here if freshness needs change.
const STATS_REVALIDATE = 300; // 5 minutes

// ---------------------------------------------------------------------------
// Typed error
// ---------------------------------------------------------------------------

export class AugurApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "AugurApiError";
  }
}

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
// Raw wire types (snake_case, as received from the API)
// ---------------------------------------------------------------------------

interface RawI18nString {
  en: string;
  fr: string;
}

interface RawTimeframeMeta {
  instrument: string;
  timeframe: string;
  data_range: string[];
  total_samples: number;
}

interface RawStatFamilyMeta {
  family: string;
  title: RawI18nString;
  definition: RawI18nString;
  timeframes: RawTimeframeMeta[];
}

interface RawStatResultRow {
  condition: string;
  outcome: string;
  count: number;
  total: number;
  probability: number;
  baseline_prob: number;
  baseline_n: number;
  value?: number | null;
  value_baseline?: number | null;
}

interface RawSliceGroupResult {
  label: RawI18nString;
  total_samples: number;
  results: RawStatResultRow[];
}

interface RawSliceResult {
  dimension: string;
  groups: Record<string, RawSliceGroupResult>;
}

interface RawTimeframeResult {
  data_range: string[];
  total_samples: number;
  results: RawStatResultRow[];
  slices?: Record<string, RawSliceResult>;
}

interface RawLabels {
  conditions: Record<string, RawI18nString>;
  outcomes: Record<string, RawI18nString>;
  dimensions?: Record<string, RawI18nString>;
}

interface RawStatRunResult {
  stat_name: string;
  title: RawI18nString;
  definition: RawI18nString;
  labels: RawLabels;
  instruments: Record<string, Record<string, RawTimeframeResult>>;
}

// ---------------------------------------------------------------------------
// Mapper functions (explicit, typed — no blanket deep-camelCaser)
// Dynamic map keys (instrument codes, timeframe codes, condition/outcome/dimension
// codes, slice/group keys) are passed through verbatim.
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

// ---------------------------------------------------------------------------
// Fetch helper
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
    throw new AugurApiError(
      `Augur API returned null data for ${endpoint}`,
    );
  }

  return envelope.data;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getHealth(): Promise<HealthStatus> {
  // Public endpoint — no API key. Never cached, so it reflects live status.
  return fetchAugur<HealthStatus>("/health", { cache: "no-store" });
}

export async function getStatCatalog(): Promise<StatFamilyMeta[]> {
  const apiKey = getApiKey();
  const raw = await fetchAugur<RawStatFamilyMeta[]>("/api/v1/stats", {
    headers: { "X-API-Key": apiKey },
    next: { revalidate: STATS_REVALIDATE },
  });
  return raw.map(mapStatFamilyMeta);
}

export async function getStatDetail(statId: string): Promise<StatRunResult> {
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
