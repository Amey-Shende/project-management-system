"use client";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Code2, Folder, FolderKanban } from "lucide-react";
import { ProjectFull } from "./ProjectList";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import { renderRequired } from "@/lib/renderRequired";
import { MultiSelect } from "@/components/MultiSelect";

const baseSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must not exceed 100 characters"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED"]),
  pmIds: z.array(z.number()).optional(),
  tlIds: z.array(z.number()).optional(),
  teamMembers: z.array(z.number()).optional(),
  techstack: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

const createSchema = baseSchema.extend({
  status: z.enum(["ACTIVE", "COMPLETED"]).default("ACTIVE"),
});

const updateSchema = baseSchema.partial();

type FormData = z.infer<typeof createSchema>;

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
];

interface ProjectDialogProps {
  project?: ProjectFull;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (projectData: {
    name: string;
    description?: string;
    status?: "ACTIVE" | "COMPLETED";
    pmIds?: number[];
    tlIds?: number[];
    teamMembers?: number[];
    techstack?: unknown;
    priority?: "LOW" | "MEDIUM" | "HIGH";
  }) => Promise<void>;
  onUpdate: (projectData: {
    id: number;
    name?: string;
    description?: string;
    status?: "ACTIVE" | "COMPLETED";
    pmIds?: number[];
    tlIds?: number[];
    teamMembers?: number[];
    techstack?: unknown;
    priority?: "LOW" | "MEDIUM" | "HIGH";
  }) => Promise<void>;
  addDialog?: {
    title: string;
    description: string;
    updateTitle?: string;
    updateDescription?: string;
  };
  projectManagers?: Array<{ id: number; name: string }>;
}

interface User {
  id: number;
  name: string;
  email: string;
  managerId?: number | null;
}

export function ProjectDialog({
  project,
  open,
  onOpenChange,
  onSave,
  onUpdate,
  addDialog,
  projectManagers,
}: ProjectDialogProps) {
  const isEditMode = !!project?.id;
  const formSchema = isEditMode ? updateSchema : createSchema;
  type FormData = z.infer<typeof formSchema>;
  type CreateFormData = z.infer<typeof createSchema>;
  type UpdateFormData = z.infer<typeof updateSchema>;

  // const [projectManagers, setProjectManagers] = useState<User[]>([]);
  const [teamLeads, setTeamLeads] = useState<User[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [tlWarning, setTlWarning] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      status: "ACTIVE",
      pmIds: [],
      tlIds: [],
      teamMembers: [],
      priority: "MEDIUM",
    },
  });

  useEffect(() => {
    if (project && open) {
      // Extract PM, TL, and TM IDs from project members
      const existingPmIds =
        project.members?.filter((m: any) => m.role === "PM").map((m: any) => m.user.id) || [];
      const existingTlIds =
        project.members?.filter((m: any) => m.role === "TL").map((m: any) => m.user.id) || [];
      const existingTeamMemberIds =
        project.members?.filter((m: any) => m.role === "TM").map((m: any) => m.user.id) || [];

      form.reset({
        name: project.name,
        description: project.description || "",
        status: project.status,
        pmIds: existingPmIds,
        tlIds: existingTlIds,
        teamMembers: existingTeamMemberIds,
        techstack: Array.isArray(project?.techstack)
          ? (project.techstack as string[]).join(", ")
          : "",
        priority: project.priority || "MEDIUM",
      });
    } else if (open) {
      form.reset({
        name: "",
        description: "",
        status: "ACTIVE",
        pmIds: [],
        tlIds: [],
        teamMembers: [],
        priority: "MEDIUM",
      });
    }
  }, [project, open, form]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!open) return;
      setLoadingUsers(true);
      try {
        const [tlRes, tmRes] = await Promise.all([
          // api.get("/users?role=PM"),
          api.get("/users?role=TL"),
          api.get("/users?role=TM"),
        ]);
        // setProjectManagers(pmRes.data.data);
        setTeamLeads(tlRes.data.data);
        setTeamMembers(tmRes.data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [open]);

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  // Handle PM change to select subordinate TLs
  const handlePMChange = (pmIds: number[] | undefined) => {
    if (pmIds && pmIds.length > 0) {
      // Find subordinate TLs (TLs where managerId is in selected PM IDs)
      const subordinateTLs = teamLeads
        .filter((tl) => tl.managerId && pmIds.includes(tl.managerId))
        .sort((a, b) => a.name.localeCompare(b.name));

      if (subordinateTLs.length > 0) {
        // Select all subordinate TLs
        form.setValue("tlIds", subordinateTLs.map((tl) => tl.id));
        setTlWarning("");

        // Auto-select TMs under these TLs
        const tmIdsUnderTLs = teamMembers
          .filter((tm) => tm.managerId && subordinateTLs.some((tl) => tl.id === tm.managerId))
          .map((tm) => tm.id);
        form.setValue("teamMembers", tmIdsUnderTLs);
      } else {
        form.setValue("tlIds", []);
        form.setValue("teamMembers", []);
      }
    } else {
      form.setValue("tlIds", []);
      setTlWarning("");
      form.setValue("teamMembers", []);
    }
  };

  // Handle TL change to show warning if not subordinate and auto-select TMs
  const handleTLChange = (tlIds: number[] | undefined) => {
    const pmIds = form.getValues("pmIds");

    if (tlIds && tlIds.length > 0) {
      // Check if any selected TL is not subordinate
      const hasNonSubordinate = tlIds.some((tlId) => {
        const tl = teamLeads.find((t) => t.id === tlId);
        return tl?.managerId && pmIds && pmIds.length > 0 && !pmIds.includes(tl.managerId);
      });

      if (pmIds && pmIds.length > 0 && hasNonSubordinate) {
        setTlWarning(
          "Some Team Leads are not direct subordinates of the selected Project Manager(s).",
        );
      } else {
        setTlWarning("");
      }

      // Auto-select TMs that belong to these TLs
      const tmIdsUnderTLs = teamMembers
        .filter((tm) => tm.managerId && tlIds.includes(tm.managerId))
        .map((tm) => tm.id);
      form.setValue("teamMembers", tmIdsUnderTLs);
    } else {
      setTlWarning("");
      form.setValue("teamMembers", []);
    }
  };

  const onSubmit = async (data: FormData) => {
    const selectedTlIds = data.tlIds || [];
    const selectedTeamMemberIds = data.teamMembers || [];

    // Update reporting manager for all team members in the project (assign to first TL)
    if (selectedTlIds.length > 0 && selectedTeamMemberIds.length > 0) {
      try {
        await Promise.all(
          selectedTeamMemberIds.map((memberId) =>
            api.patch(`/users/${memberId}`, { managerId: selectedTlIds[0] }),
          ),
        );
      } catch (error) {
        console.error("Error updating reporting managers:", error);
      }
    }

    if (project?.id) {
      await onUpdate({
        ...(data as UpdateFormData),
        id: project.id,
        pmIds: (data as UpdateFormData).pmIds,
        tlIds: (data as UpdateFormData).tlIds,
        teamMembers: (data as UpdateFormData).teamMembers,
        techstack: data?.techstack
          ? data.techstack
              ?.split(",")
              .map((s) => s?.trim())
              ?.filter(Boolean)
          : undefined,
      });
    } else {
      const createData = data as CreateFormData;
      await onSave({
        name: createData.name,
        description: createData.description,
        status: createData.status,
        pmIds: createData.pmIds,
        tlIds: createData.tlIds,
        teamMembers: createData.teamMembers,
        techstack:
          createData.techstack && createData.techstack.trim()
            ? createData.techstack
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
      });
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {project ? addDialog?.updateTitle : addDialog?.title}
          </DialogTitle>
          <DialogDescription>
            {project
              ? addDialog?.updateDescription ||
                "Update the project details below."
              : addDialog?.description ||
                "Fill in the details to add a new project."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="project-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-1"
        >
          <FieldGroup className="gap-5">
            {/* Name Field */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">
                    {renderRequired("Project Name")}
                  </FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <FolderKanban className="h-4 w-4 mt-1" />
                    </span>
                    <Input
                      {...field}
                      id="name"
                      placeholder="Enter project name"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                      className="h-10 pl-10"
                    />
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Description Field */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="Enter project description"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    className="h-24 p-2 max-h-34"
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Techstack Field */}
            <Controller
              name="techstack"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="techstack">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4" />
                      Tech Stack (comma separated)
                    </div>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="techstack"
                    placeholder="Add technologies like React, TypeScript, TailwindCSS"
                    aria-invalid={fieldState.invalid}
                    className="h-10"
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Project Manager Multi-Select */}
              <Controller
                name="pmIds"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="pmIds">Project Managers</FieldLabel>
                    <MultiSelect
                      options={projectManagers?.map((pm) => ({
                        label: pm.name,
                        value: pm.id,
                      })) || []}
                      value={field.value || []}
                      onChange={(value) => {
                        field.onChange(value);
                        handlePMChange(value);
                      }}
                      selectLabel="Project Managers"
                      placeholder="Select project managers"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              {/* Team Lead Multi-Select */}
              <Controller
                name="tlIds"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="tlIds">Team Leads</FieldLabel>
                      <MultiSelect
                        options={teamLeads.map((tl) => ({
                          label: tl.name,
                          value: tl.id,
                        }))}
                        value={field.value || []}
                        onChange={(value) => {
                          field.onChange(value);
                          handleTLChange(value);
                        }}
                        selectLabel="Team Leads"
                        placeholder="Select team leads"
                      />
                      {tlWarning && (
                        <p className="text-xs text-amber-600 mt-1">
                          {tlWarning}
                        </p>
                      )}
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  );
                }}
              />

              {/* Team Members Multi-Select */}
              <Controller
                name="teamMembers"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="teamMembers">Team Members</FieldLabel>
                    <MultiSelect
                      options={teamMembers.map((tm) => ({
                        label: tm.name,
                        value: tm.id,
                      }))}
                      value={field.value || []}
                      onChange={field.onChange}
                      selectLabel="Team Members"
                      placeholder="Select team members"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              {/* Status Field */}
              <Controller
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-10!">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Status</SelectLabel>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </form>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-10 w-24"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="project-form"
            disabled={isSubmitting}
            className="h-10 w-24"
          >
            {isSubmitting ? "Saving..." : project ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
