"use client";

import { Button } from "@/components/ui/button";

import { CalendarDays, CheckCheck, Circle, ListTodo, Plus } from "lucide-react";

// type Filter = "all" | "active" | "completed"
// type ViewMode = "list" | "calendar"

type TodoFiltersProps = {
  // filter: Filter
  // viewMode: ViewMode
  // count: { total: number; active: number; completed: number }
  // onFilterChange: (filter: Filter) => void
  // onViewModeChange: (viewMode: ViewMode) => void
  onAddUser: () => void;
};

export function ProjectMangerFilter({ onAddUser }: TodoFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Project Managers</h2>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button onClick={onAddUser} size="sm" className="rounded-full">
          <Plus className="h-4 w-4" />
          <span className="text-[13px]">Add Project Manager</span>
        </Button>
      </div>
    </div>
  );
}
