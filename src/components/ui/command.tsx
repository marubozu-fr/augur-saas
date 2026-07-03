"use client";

import * as React from "react";
import {
  Command as CommandPrimitive,
  CommandEmpty as CommandEmptyPrimitive,
  CommandGroup as CommandGroupPrimitive,
  CommandInput as CommandInputPrimitive,
  CommandItem as CommandItemPrimitive,
  CommandList as CommandListPrimitive,
} from "cmdk";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn("flex h-full w-full flex-col overflow-hidden", className)}
      {...props}
    />
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandInputPrimitive>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex items-center gap-2 border-b border-border pb-2 mb-2 text-subtle"
    >
      <SearchIcon className="size-3.5 shrink-0" aria-hidden="true" />
      <CommandInputPrimitive
        data-slot="command-input"
        className={cn(
          "flex-1 bg-transparent text-sm text-foreground placeholder:text-subtle outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandListPrimitive>) {
  return (
    <CommandListPrimitive
      data-slot="command-list"
      className={cn("flex flex-col gap-px", className)}
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandEmptyPrimitive>) {
  return (
    <CommandEmptyPrimitive
      data-slot="command-empty"
      className={cn(
        "py-4 text-center text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandGroupPrimitive>) {
  return (
    <CommandGroupPrimitive
      data-slot="command-group"
      className={cn("flex flex-col gap-px", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandItemPrimitive>) {
  return (
    <CommandItemPrimitive
      data-slot="command-item"
      className={cn(
        "flex items-center justify-between gap-3 rounded-sm p-2 text-muted-foreground",
        "cursor-pointer select-none outline-none",
        "data-[selected=true]:bg-card data-[selected=true]:text-foreground",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
};
