"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDownIcon, CheckIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import { getInstrumentName } from "@/lib/instruments";

interface InstrumentSelectorProps {
  instruments: string[];
  activeInstrument: string;
}

export function InstrumentSelector({
  instruments,
  activeInstrument,
}: InstrumentSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  function handleValueChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("instrument", value);
    router.push(`${pathname}?${params.toString()}`);
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
                value={`${code} ${getInstrumentName(code)}`}
                onSelect={() => handleValueChange(code)}
              >
                <span className="flex items-baseline gap-2">
                  <span className="font-mono text-sm font-semibold">{code}</span>
                  <span className="text-xs text-subtle">
                    {getInstrumentName(code)}
                  </span>
                </span>
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
