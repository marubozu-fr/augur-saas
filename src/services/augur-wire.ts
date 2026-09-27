// Raw wire types for the Augur API stats schema (snake_case, as received
// from the live API and as stored in the bundled demo-data/results/*.json
// snapshot — both share the exact same shape). Shared between
// src/services/augur.ts (live API client + mappers) and
// src/services/augur-snapshot.ts (demo-mode snapshot reader) so the two never
// duplicate these interfaces.

export interface RawI18nString {
  en: string;
  fr: string;
}

export interface RawTimeframeMeta {
  instrument: string;
  timeframe: string;
  data_range: string[];
  total_samples: number;
}

export interface RawStatFamilyMeta {
  family: string;
  title: RawI18nString;
  definition: RawI18nString;
  timeframes: RawTimeframeMeta[];
}

export interface RawStatResultRow {
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

export interface RawSliceGroupResult {
  label: RawI18nString;
  total_samples: number;
  results: RawStatResultRow[];
}

export interface RawSliceResult {
  dimension: string;
  groups: Record<string, RawSliceGroupResult>;
}

export interface RawTimeframeResult {
  data_range: string[];
  total_samples: number;
  results: RawStatResultRow[];
  slices?: Record<string, RawSliceResult>;
}

export interface RawLabels {
  conditions: Record<string, RawI18nString>;
  outcomes: Record<string, RawI18nString>;
  dimensions?: Record<string, RawI18nString>;
}

export interface RawStatRunResult {
  stat_name: string;
  title: RawI18nString;
  definition: RawI18nString;
  labels: RawLabels;
  instruments: Record<string, Record<string, RawTimeframeResult>>;
}
