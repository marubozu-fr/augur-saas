// TypeScript interfaces for the Augur API stats schema.
// Field names are camelCase (transformed from snake_case wire format).
// Dynamic map keys (instrument codes, timeframe codes, condition/outcome/dimension
// codes, slice dimension names, group keys) are preserved verbatim as they appear
// in the API response — they are data identifiers, not structural field names.

export interface I18nString {
  en: string;
  fr: string;
}

export interface TimeframeMeta {
  instrument: string;
  timeframe: string;
  dataRange: string[];
  totalSamples: number;
}

export interface StatFamilyMeta {
  family: string;
  title: I18nString;
  definition: I18nString;
  timeframes: TimeframeMeta[];
}

export interface StatResultRow {
  condition: string;
  outcome: string;
  count: number;
  total: number;
  probability: number;
  baselineProb: number;
  baselineN: number;
  value?: number | null;
  valueBaseline?: number | null;
}

export interface SliceGroupResult {
  label: I18nString;
  totalSamples: number;
  results: StatResultRow[];
}

export interface SliceResult {
  dimension: string;
  // Keys are group identifiers (e.g. weekday codes, size bucket codes). Preserved verbatim.
  groups: Record<string, SliceGroupResult>;
}

export interface TimeframeResult {
  dataRange: string[];
  totalSamples: number;
  results: StatResultRow[];
  // Keys are dimension names. Preserved verbatim.
  slices: Record<string, SliceResult>;
}

export interface Labels {
  // Keys are condition/outcome/dimension codes. Preserved verbatim.
  conditions: Record<string, I18nString>;
  outcomes: Record<string, I18nString>;
  dimensions: Record<string, I18nString>;
}

export interface StatRunResult {
  statName: string;
  title: I18nString;
  definition: I18nString;
  labels: Labels;
  // Keys: instrumentCode → timeframeCode → TimeframeResult. Preserved verbatim.
  instruments: Record<string, Record<string, TimeframeResult>>;
}

export interface HealthStatus {
  status: string;
}
