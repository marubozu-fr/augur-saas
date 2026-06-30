"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDownIcon, CheckIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";

interface InstrumentSelectorProps {
  instruments: string[];
  activeInstrument: string;
  /**
   * URL template containing the literal `{instrument}` placeholder.
   * Dashboard passes "/dashboard/{instrument}".
   * Stat detail passes "/stats/{instrument}/{statId}".
   * On select, `{instrument}` is replaced with the lowercased code and the
   * current query string (e.g. ?timeframe=daily) is appended.
   */
  hrefTemplate: string;
}

export function InstrumentSelector({
  instruments,
  activeInstrument,
  hrefTemplate,
}: InstrumentSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  function handleValueChange(value: string) {
    const url = hrefTemplate.replace("{instrument}", value.toLowerCase());
    const qs = searchParams.toString();
    router.push(qs ? `${url}?${qs}` : url);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={`Instrument: ${activeInstrument}. Search instruments`}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="inline-flex items-center justify-between gap-3 h-10 min-w-40 px-3 rounded-md border border-border bg-card font-mono text-sm font-semibold text-foreground hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-brand transition-colors cursor-pointer"
        >
          <span>{activeInstrument}</span>
          <ChevronDownIcon
            className="size-4 text-subtle shrink-0"
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="min-w-56 p-2">
        <Command>
          <CommandInput placeholder="Search instruments…" />
          <CommandList>
            <CommandEmpty>No instruments found.</CommandEmpty>
            {instruments.map((code) => (
              <CommandItem
                key={code}
                value={code}
                onSelect={() => handleValueChange(code)}
              >
                <span className="font-mono text-sm font-semibold">{code}</span>
                {code === activeInstrument && (
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
  );
}
