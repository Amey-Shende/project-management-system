"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";

type ProjectFiltersProps = {
  onAddProject: () => void;
  onSearchChange?: (search: string) => void;
  onStatusChange?: (status: string) => void;
  onPMChange?: (pmId: string) => void;
  searchValue?: string;
  statusValue?: string;
  pmValue?: string;
  projectManagers?: Array<{ id: number; name: string }>;
};

export function ProjectFilter({
  onAddProject,
  onSearchChange,
  onStatusChange,
  onPMChange,
  searchValue = "",
  statusValue = "",
  pmValue = "",
  projectManagers = [],
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Projects</h2>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {/* <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="h-10 w-64 pl-9"
          />
        </div> */}
        <Select value={statusValue} onValueChange={onStatusChange}>
          <SelectTrigger className="h-10 w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={pmValue} onValueChange={onPMChange}>
          <SelectTrigger className="h-10 w-48">
            <SelectValue placeholder="Project Manager" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Project Manager</SelectLabel>
              <SelectItem value="all">All Managers</SelectItem>
              {projectManagers.map((pm) => (
                <SelectItem key={pm.id} value={String(pm.id)}>
                  {pm.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button onClick={onAddProject} size="sm" className="rounded-full px-4">
          <Plus className="h-4 w-4" />
          <span className="text-[13px]">Add Project</span>
        </Button>
      </div>
    </div>
  );
}
