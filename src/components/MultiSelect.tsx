"use client";

import * as React from "react";
import { ChevronDown, ChevronsDownIcon, ChevronsUpDown } from "lucide-react";
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
};

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options",
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
          <span className="truncate flex-1">
            {selectedLabels.length === 0
              ? placeholder
              : selectedLabels.length === options.length
              ? "All selected"
              : selectedLabels.length <= 3
              ? selectedLabels.join(", ")
              : `${selectedLabels.slice(0, 2).join(", ")} +${selectedLabels.length - 2} more`}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0"
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
          <div
            onClick={toggleAll}
            className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground relative select-none outline-none transition-colors"
          >
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) {
                  (el as any).indeterminate = isIndeterminate;
                }
              }}
              className="border border-gray-300"
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
                className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground relative select-none outline-none transition-colors"
              >
                <Checkbox checked={isSelected} className="border border-gray-300"/>
                <span className="text-sm">{option.label}</span>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
