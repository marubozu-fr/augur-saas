"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  function handleValueChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("instrument", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={activeInstrument} onValueChange={handleValueChange}>
      <SelectTrigger
        aria-label="Select instrument"
        className="h-9 border-border bg-card text-sm font-semibold text-foreground hover:border-border-strong focus:border-brand focus-visible:ring-0 focus-visible:border-brand"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-card border-border text-foreground">
        {instruments.map((inst) => (
          <SelectItem key={inst} value={inst}>
            {inst}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
