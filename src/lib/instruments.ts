export const INSTRUMENT_NAMES: Record<string, string> = {
  NQ: "Nasdaq 100",
  ES: "S&P 500",
  YM: "Dow Jones 30",
  RTY: "Russell 2000",
};

export function getInstrumentName(code: string): string {
  return INSTRUMENT_NAMES[code] ?? code;
}
