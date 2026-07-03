"use server";

// Server Action wrapping loadStatSlice() — invoked by StatDetailClient when
// timeframe/period/custom-range client state changes, so the Augur API key
// never has to reach the browser while still enabling client-driven refetch.

import { loadStatSlice } from "./load-stat-slice";
import type { StatSliceInput, StatSliceResult } from "./load-stat-slice";

export async function fetchStatSlice(
  input: StatSliceInput,
): Promise<StatSliceResult> {
  return loadStatSlice(input);
}
