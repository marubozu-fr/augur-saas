// Server-only reader for the bundled demo-mode snapshot
// (demo-data/results/*.json — see scripts/sync-demo-snapshot.sh and
// demo-data/SOURCE). Used exclusively by src/services/augur.ts when
// isDemoMode() is true; never import this from a client component.
//
// SECURITY: statId is untrusted (it comes straight from the URL). This module
// never builds a file path from it — the only paths ever touched come from
// `readdir()` on the fixed snapshot directory. Callers resolve statId by
// looking it up in the Map returned by loadSnapshot(); an unresolved statId
// throws AugurApiError(404) instead of touching the filesystem.

import "server-only";

import { readdir, readFile } from "fs/promises";
import path from "path";
import { AugurApiError } from "@/services/augur-errors";
import type { RawStatRunResult } from "@/services/augur-wire";

const SNAPSHOT_DIR = path.join(process.cwd(), "demo-data", "results");
const JSON_EXTENSION = ".json";

// Parsed once per server lifetime — the snapshot is a static build artifact
// bundled at build time (see next.config.ts outputFileTracingIncludes), so it
// never needs to be re-read or revalidated.
let snapshotPromise: Promise<Map<string, RawStatRunResult>> | null = null;

async function loadSnapshot(): Promise<Map<string, RawStatRunResult>> {
  if (!snapshotPromise) {
    snapshotPromise = (async () => {
      const entries = await readdir(SNAPSHOT_DIR, { withFileTypes: true });
      const families = new Map<string, RawStatRunResult>();
      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith(JSON_EXTENSION)) continue;
        const family = entry.name.slice(0, -JSON_EXTENSION.length);
        const filePath = path.join(SNAPSHOT_DIR, entry.name);
        const contents = await readFile(filePath, "utf-8");
        families.set(family, JSON.parse(contents) as RawStatRunResult);
      }
      return families;
    })().catch((err: unknown) => {
      // Don't cache a rejection for the server lifetime — a transient failure
      // (e.g. a missing directory) should not permanently break demo mode.
      snapshotPromise = null;
      throw err;
    });
  }
  return snapshotPromise;
}

/**
 * One entry per parsed family, sorted by family name (the file stem, not the
 * file's own `stat_name` field) — mirrors the backend's
 * StatsLoader.list_families() ordering (sorted(self._cache.items())), which
 * keys and sorts by file stem too. Used to build the demo-mode stat catalog.
 */
export interface SnapshotFamilyResult {
  family: string;
  result: RawStatRunResult;
}

export async function listSnapshotResults(): Promise<SnapshotFamilyResult[]> {
  const snapshot = await loadSnapshot();
  return Array.from(snapshot.keys())
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)) // mirrors Python's sorted()
    .map((family) => ({ family, result: snapshot.get(family)! }));
}

/**
 * Resolves `statId` against the known family names and returns the parsed
 * file. An unknown statId throws AugurApiError(404) — see the SECURITY note
 * above.
 */
export async function getSnapshotResult(
  statId: string,
): Promise<RawStatRunResult> {
  const snapshot = await loadSnapshot();
  const result = snapshot.get(statId);
  if (!result) {
    throw new AugurApiError(`Unknown stat family: ${statId}`, 404);
  }
  return result;
}

/**
 * The latest `data_range` end date (ISO "YYYY-MM-DD") across every
 * instrument/timeframe of every family in the snapshot — i.e. how fresh the
 * frozen demo data is. Used by DemoBanner. Computed from the parsed files on
 * every call (no hardcoded date); the snapshot itself is only ever parsed
 * once per server lifetime (see loadSnapshot above).
 */
export async function getSnapshotDataEnd(): Promise<string> {
  const snapshot = await loadSnapshot();
  let latest: string | null = null;
  for (const result of snapshot.values()) {
    for (const timeframes of Object.values(result.instruments)) {
      for (const timeframeResult of Object.values(timeframes)) {
        const end = timeframeResult.data_range[1];
        if (end && (latest === null || end > latest)) {
          latest = end;
        }
      }
    }
  }
  if (!latest) {
    throw new AugurApiError("Snapshot has no data_range", 500);
  }
  return latest;
}
