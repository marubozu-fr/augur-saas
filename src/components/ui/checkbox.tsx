"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-[1.125rem] shrink-0 rounded-sm border border-border-strong bg-background cursor-pointer transition-colors",
        "hover:border-neutral",
        "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-ring focus-visible:border-brand",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-brand data-[state=checked]:border-brand data-[state=checked]:text-on-brand",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
