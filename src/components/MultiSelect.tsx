"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronsDownIcon, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

type Option = {
  label: string;
  value: number;
};

type MultiSelectProps = {
  options: Option[];
  value: number[];
  onChange: (value: number[]) => void;
  placeholder?: string;
  selectLabel?: string;
};

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options",
  selectLabel = "Select",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const allValues = options.map((o) => o.value);

  const isAllSelected = value.length === options.length;
  const isIndeterminate = value.length > 0 && value.length < options.length;

  const toggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(allValues);
    }
  };

  const toggleValue = (val: number) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full hover:bg-white font-normal text-start"
        >
          <div className="flex flex-1 items-center gap-1 overflow-hidden">
            {selectedLabels.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedLabels.slice(0, 2).map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                  >
                    {label}
                  </span>
                ))}
                {selectedLabels.length > 2 && (
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                    +{selectedLabels.length - 2} more
                  </span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div
          className="max-h-60 overflow-y-auto scrollbar-thin"
          onWheel={(e) => {
            e.stopPropagation();
            e.currentTarget.scrollTop += e.deltaY;
          }}
        >
          {/* ✅ Select All */}
          {/* heading of select box */}
          <p className="px-2 mt-2 text-muted-foreground text-xs">
            {selectLabel}
          </p>
          <div
            onClick={toggleAll}
            className="flex items-center gap-3 px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground relative select-none outline-none transition-colors"
          >
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) {
                  (el as any).indeterminate = isIndeterminate;
                }
              }}
              className="border border-gray-400"
            />
            <span className="text-sm font-medium">Select All</span>
          </div>

          {/* ✅ Options */}
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <div
                key={option.value}
                onClick={() => toggleValue(option.value)}
                className="flex items-center gap-3 px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground relative select-none outline-none transition-colors"
              >
                <Checkbox
                  checked={isSelected}
                  className="border border-gray-400"
                />
                <span className="text-sm">{option.label}</span>
                {value.includes(option.value) && (
                  <Check className="h-4 w-4 text-primary absolute right-2" />
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
