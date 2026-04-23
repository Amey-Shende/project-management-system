"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type ProjectFiltersProps = {
  onAddProject: () => void;
};

export function ProjectFilter({ onAddProject }: ProjectFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Projects</h2>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button onClick={onAddProject} size="sm" className="rounded-full px-4">
          <Plus className="h-4 w-4" />
          <span className="text-[13px]">Add Project</span>
        </Button>
      </div>
    </div>
  );
}
