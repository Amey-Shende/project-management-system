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
  pmId: z.number().optional().nullable(),
  tlId: z.number().optional().nullable(),
  teamMembers: z.array(z.number()).optional(),
  techstack: z.string().optional(),
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
    pmId?: number;
    tlId?: number;
    teamMembers?: number[];
    techstack?: unknown;
  }) => Promise<void>;
  onUpdate: (projectData: {
    id: number;
    name?: string;
    description?: string;
    status?: "ACTIVE" | "COMPLETED";
    pmId?: number;
    tlId?: number;
    teamMembers?: number[];
    techstack?: unknown;
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
      pmId: undefined,
      tlId: undefined,
      teamMembers: [],
    },
  });

  useEffect(() => {
    if (project && open) {
      // Extract team member IDs from project members
      const existingTeamMemberIds =
        project.members?.map((m: any) => m.user.id) || [];

      form.reset({
        name: project.name,
        description: project.description || "",
        status: project.status,
        pmId: project.pmId,
        tlId: project.tlId || undefined,
        teamMembers: existingTeamMemberIds,
        techstack: Array.isArray(project?.techstack)
          ? (project.techstack as string[]).join(", ")
          : "",
      });
    } else if (open) {
      form.reset({
        name: "",
        description: "",
        status: "ACTIVE",
        pmId: undefined,
        tlId: undefined,
        teamMembers: [],
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

  // Handle PM change to select first subordinate TL
  const handlePMChange = (pmId: number | undefined) => {
    if (pmId) {
      // Find subordinate TLs (TLs where managerId === selected PM ID)
      const subordinateTLs = teamLeads
        .filter((tl) => tl.managerId === pmId)
        .sort((a, b) => a.name.localeCompare(b.name));

      if (subordinateTLs.length > 0) {
        // Select first subordinate TL alphabetically
        form.setValue("tlId", subordinateTLs[0].id);
        setTlWarning("");

        // Auto-select TMs under this TL
        const tmIdsUnderTL = teamMembers
          .filter((tm) => tm.managerId === subordinateTLs[0].id)
          .map((tm) => tm.id);
        form.setValue("teamMembers", tmIdsUnderTL);
      } else {
        form.setValue("tlId", undefined);
        form.setValue("teamMembers", []);
      }
    } else {
      form.setValue("tlId", undefined);
      setTlWarning("");
      form.setValue("teamMembers", []);
    }
  };

  // Handle TL change to show warning if not subordinate and auto-select TMs
  const handleTLChange = (tlId: number | undefined) => {
    const pmId = form.getValues("pmId");

    if (tlId) {
      const selectedTL = teamLeads.find((tl) => tl.id === tlId);
      const isSubordinate = selectedTL?.managerId === pmId;

      if (pmId && !isSubordinate) {
        setTlWarning(
          "This Team Lead is not a direct subordinate of the selected Project Manager.",
        );
      } else {
        setTlWarning("");
      }

      // Auto-select TMs that belong to this TL
      const tmIdsUnderTL = teamMembers
        .filter((tm) => tm.managerId === tlId)
        .map((tm) => tm.id);
      form.setValue("teamMembers", tmIdsUnderTL);
    } else {
      setTlWarning("");
      form.setValue("teamMembers", []);
    }
  };

  const onSubmit = async (data: FormData) => {
    const selectedTlId = data.tlId;
    const selectedTeamMemberIds = data.teamMembers || [];

    // Update reporting manager for all team members in the project
    if (selectedTlId && selectedTeamMemberIds.length > 0) {
      try {
        await Promise.all(
          selectedTeamMemberIds.map((memberId) =>
            api.patch(`/users/${memberId}`, { managerId: selectedTlId }),
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
        pmId: (data as UpdateFormData).pmId ?? undefined,
        tlId: (data as UpdateFormData).tlId ?? undefined,
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
        pmId: createData.pmId ?? undefined,
        tlId: createData.tlId ?? undefined,
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
              {/* Project Manager Field */}
              <Controller
                name="pmId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="pmId">Project Manager</FieldLabel>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                        handlePMChange(Number(value));
                      }}
                    >
                      <SelectTrigger className="w-full h-10!">
                        <SelectValue placeholder="Select Project Manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Project Managers</SelectLabel>
                          {loadingUsers ? (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) : projectManagers?.length === 0 ? (
                            <SelectItem value="no-managers" disabled>
                              No managers available
                            </SelectItem>
                          ) : (
                            projectManagers?.map((pm) => (
                              <SelectItem key={pm.id} value={String(pm.id)}>
                                {pm.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              {/* Team Lead Field */}
              <Controller
                name="tlId"
                control={form.control}
                render={({ field, fieldState }) => {
                  const pmId = form.getValues("pmId");
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="tlId">Team Lead</FieldLabel>
                      <Select
                        value={field.value ? String(field.value) : undefined}
                        onValueChange={(value) => {
                          field.onChange(Number(value));
                          handleTLChange(Number(value));
                        }}
                      >
                        <SelectTrigger className="w-full h-10!">
                          <SelectValue placeholder="Select Team Lead" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Team Leads</SelectLabel>
                            {loadingUsers ? (
                              <SelectItem value="loading" disabled>
                                Loading...
                              </SelectItem>
                            ) : teamLeads.length === 0 ? (
                              <SelectItem value="no-leads" disabled>
                                No team leads available
                              </SelectItem>
                            ) : (
                              teamLeads.map((tl) => {
                                const isSubordinate = tl.managerId === pmId;
                                return (
                                  <SelectItem key={tl.id} value={String(tl.id)}>
                                    <span
                                      className={
                                        isSubordinate && pmId
                                          ? "font-semibold"
                                          : ""
                                      }
                                    >
                                      {tl.name}
                                    </span>
                                  </SelectItem>
                                );
                              })
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
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
