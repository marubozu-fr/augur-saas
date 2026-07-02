// Context zone — the prominent "what am I looking at" surface. Defines the
// instrument, stat family and period. Changing any control here re-scopes
// the whole page (via StatDetailClient's URL updates).
//
// DEVIATION from the mockup: the catalog (StatFamilyMeta) has no "category"
// field, so the Stat combobox shows only the family title (no category
// sub-label under each option).

"use client";

import { useState } from "react";
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { format } from "date-fns";
import type { DateRange as CalendarRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { isIsoDate } from "@/lib/stat-context";
import type { PeriodPreset } from "@/lib/period";
import type { StatFamilyMeta } from "@/types/stats";

const PERIOD_PRESET_ITEMS: { value: PeriodPreset; label: string }[] = [
  { value: "1m", label: "1m" },
  { value: "3m", label: "3m" },
  { value: "6m", label: "6m" },
  { value: "ytd", label: "YTD" },
  { value: "1yr", label: "1yr" },
  { value: "2yr", label: "2yr" },
  { value: "3yr", label: "3yr" },
  { value: "5yr", label: "5yr" },
  { value: "10yr", label: "10yr" },
];

const TOGGLE_ITEM_CLASS =
  "h-7 rounded-[calc(var(--radius-md)-2px)] font-mono text-xs font-semibold text-muted-foreground hover:text-foreground data-[state=on]:bg-brand data-[state=on]:text-on-brand";

interface ContextZoneProps {
  statId: string;
  catalog: StatFamilyMeta[];
  instruments: string[];
  activeInstrument: string;
  period: PeriodPreset;
  isCustomRange: boolean;
  customStart: string | null;
  customEnd: string | null;
  onInstrumentChange: (instrument: string) => void;
  onPeriodChange: (period: PeriodPreset) => void;
  onCustomRangeApply: (start: string, end: string) => void;
  onNavigateStat: (family: string) => void;
}

export function ContextZone({
  statId,
  catalog,
  instruments,
  activeInstrument,
  period,
  isCustomRange,
  customStart,
  customEnd,
  onInstrumentChange,
  onPeriodChange,
  onCustomRangeApply,
  onNavigateStat,
}: ContextZoneProps) {
  const [statOpen, setStatOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState<CalendarRange | undefined>(
    undefined,
  );
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");

  const activeFamily = catalog.find((f) => f.family === statId);

  function openCustom(open: boolean) {
    if (open) {
      setStartInput(customStart ?? "");
      setEndInput(customEnd ?? "");
      setPendingRange(
        customStart && customEnd
          ? { from: new Date(customStart), to: new Date(customEnd) }
          : undefined,
      );
    }
    setCustomOpen(open);
  }

  function handleCalendarSelect(range: CalendarRange | undefined) {
    setPendingRange(range);
    setStartInput(range?.from ? format(range.from, "yyyy-MM-dd") : "");
    setEndInput(range?.to ? format(range.to, "yyyy-MM-dd") : "");
  }

  function handleApply() {
    if (isIsoDate(startInput) && isIsoDate(endInput)) {
      onCustomRangeApply(startInput, endInput);
      setCustomOpen(false);
    }
  }

  return (
    <section
      aria-label="Context selectors"
      className="flex flex-col gap-4 p-5 mb-6 border border-border-strong rounded-xl bg-card shadow-md [background:radial-gradient(130%_160%_at_0%_0%,var(--brand-soft),transparent_55%),var(--card)]"
    >
      {/* Row 1 — instrument + stat */}
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex flex-col gap-2">
          <span
            id="lbl-instrument"
            className="text-xs font-semibold tracking-wider uppercase text-subtle"
          >
            Instrument
          </span>
          <Select value={activeInstrument} onValueChange={onInstrumentChange}>
            <SelectTrigger
              className="w-full md:w-36 font-mono font-semibold"
              aria-labelledby="lbl-instrument"
            >
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {instruments.map((code) => (
                <SelectItem key={code} value={code} className="font-mono">
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div
          className="hidden md:block w-px self-stretch bg-border"
          aria-hidden="true"
        />

        <div className="flex flex-col gap-2 flex-1 min-w-0 md:min-w-[18rem]">
          <span
            id="lbl-stat"
            className="text-xs font-semibold tracking-wider uppercase text-subtle"
          >
            Stat
          </span>
          <Popover open={statOpen} onOpenChange={setStatOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={statOpen}
                aria-labelledby="lbl-stat"
                className="flex w-full items-center justify-between gap-3 h-10 px-3 rounded-md border border-border bg-card font-semibold text-sm text-foreground hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-brand transition-colors cursor-pointer"
              >
                <span className="truncate">
                  {activeFamily?.title.en ?? statId}
                </span>
                <ChevronsUpDownIcon
                  className="size-4 text-subtle shrink-0"
                  aria-hidden="true"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[22rem] p-2" align="start">
              <Command>
                <CommandInput placeholder="Search stat families…" />
                <CommandList className="max-h-64 overflow-y-auto">
                  <CommandEmpty>No stat families found.</CommandEmpty>
                  {catalog.map((family) => (
                    <CommandItem
                      key={family.family}
                      value={family.title.en}
                      onSelect={() => {
                        onNavigateStat(family.family);
                        setStatOpen(false);
                      }}
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {family.title.en}
                      </span>
                      {family.family === statId && (
                        <CheckIcon
                          className="size-3.5 text-brand shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Row 2 — period */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 pt-4 border-t border-border">
        <span
          id="lbl-period"
          className="text-xs font-semibold tracking-wider uppercase text-subtle"
        >
          Period
        </span>
        <div className="flex items-center gap-3 flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible pb-1 md:pb-0">
          <ToggleGroup
            type="single"
            value={!isCustomRange && period === "all" ? "all" : ""}
            onValueChange={(value) => value && onPeriodChange("all")}
            aria-label="Full history"
            className="p-[3px] gap-[2px] rounded-md border border-border bg-card shrink-0"
          >
            <ToggleGroupItem value="all" className={TOGGLE_ITEM_CLASS}>
              All
            </ToggleGroupItem>
          </ToggleGroup>

          <span className="w-px h-5 bg-border shrink-0" aria-hidden="true" />

          <ToggleGroup
            type="single"
            value={!isCustomRange ? period : ""}
            onValueChange={(value) =>
              value && onPeriodChange(value as PeriodPreset)
            }
            aria-label="Look-back period"
            className="p-[3px] gap-[2px] rounded-md border border-border bg-card shrink-0"
          >
            {PERIOD_PRESET_ITEMS.map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                className={TOGGLE_ITEM_CLASS}
              >
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <span className="w-px h-5 bg-border shrink-0" aria-hidden="true" />

          <Popover open={customOpen} onOpenChange={openCustom}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={customOpen}
                className={[
                  "inline-flex items-center gap-2 h-9 px-3 rounded-md border text-xs font-semibold shrink-0 transition-colors",
                  isCustomRange
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border-strong",
                ].join(" ")}
              >
                <CalendarIcon className="size-3.5" aria-hidden="true" />
                Custom
                <ChevronDownIcon className="size-3.5" aria-hidden="true" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-subtle">
                    Start date
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="YYYY-MM-DD"
                    value={startInput}
                    onChange={(e) => setStartInput(e.target.value)}
                    className="h-9 px-3 rounded-md border border-border bg-background text-foreground font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-brand"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-subtle">
                    End date
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="YYYY-MM-DD"
                    value={endInput}
                    onChange={(e) => setEndInput(e.target.value)}
                    className="h-9 px-3 rounded-md border border-border bg-background text-foreground font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-brand"
                  />
                </label>
              </div>

              <Calendar
                mode="range"
                selected={pendingRange}
                onSelect={handleCalendarSelect}
                numberOfMonths={1}
                defaultMonth={pendingRange?.from}
              />

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCustomOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!isIsoDate(startInput) || !isIsoDate(endInput)}
                  onClick={handleApply}
                >
                  Apply range
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </section>
  );
}
