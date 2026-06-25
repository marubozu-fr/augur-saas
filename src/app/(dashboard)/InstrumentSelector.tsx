"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

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

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("instrument", event.target.value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={activeInstrument}
        onChange={handleChange}
        aria-label="Select instrument"
        className="appearance-none h-9 pl-3 pr-8 rounded-md border border-border bg-card text-sm font-semibold text-foreground cursor-pointer hover:border-border-strong focus:outline-none focus:border-brand transition-colors"
      >
        {instruments.map((inst) => (
          <option key={inst} value={inst}>
            {inst}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}
