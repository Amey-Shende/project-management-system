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
import { Folder } from "lucide-react";
import { Project } from "./ProjectList";
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

const baseSchema = z.object({ 
  name: z.string().min(1, "Project name is required").max(100, "Project name must not exceed 100 characters"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED"]),
  pmId: z.number().optional().nullable(),
  tlId: z.number().optional().nullable(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  teamMembers: z.array(z.number()).optional(),
});

// For creation: All fields required except description and tlId
const createSchema = baseSchema.extend({
  status: z.enum(["ACTIVE", "COMPLETED"]).default("ACTIVE"),
});

// For update: All fields optional
const updateSchema = baseSchema.partial();

type FormData = z.infer<typeof createSchema>;

// Option arrays for select dropdowns
const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
];

interface ProjectDialogProps {
  project?: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (projectData: {
    name: string;
    description?: string;
    status?: "ACTIVE" | "COMPLETED";
    pmId?: number;
    tlId?: number;
    startDate?: Date;
    endDate?: Date;
    teamMembers?: number[];
  }) => Promise<void>;
  onUpdate: (projectData: {
    id: number;
    name?: string;
    description?: string;
    status?: "ACTIVE" | "COMPLETED";
    pmId?: number;
    tlId?: number;
    startDate?: Date;
    endDate?: Date;
    teamMembers?: number[];
  }) => Promise<void>;
  addDialog?: {
    title: string;
    description: string;
    updateTitle?: string;
    updateDescription?: string;
  };
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
}: ProjectDialogProps) {
  const isEditMode = !!project?.id;
  const formSchema = isEditMode ? updateSchema : createSchema;
  type FormData = z.infer<typeof formSchema>;
  type CreateFormData = z.infer<typeof createSchema>;
  type UpdateFormData = z.infer<typeof updateSchema>;

  const [projectManagers, setProjectManagers] = useState<User[]>([]);
  const [teamLeads, setTeamLeads] = useState<User[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [filteredTeamMembers, setFilteredTeamMembers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);


  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      status: "ACTIVE",
      pmId: undefined,
      tlId: undefined,
      startDate: "",
      endDate: "",
      teamMembers: [],
    },
  });

  useEffect(() => {
    if (project && open) {
      form.reset({
        name: project.name,
        description: project.description || "",
        status: project.status,
        pmId: project.pmId,
        tlId: project.tlId || undefined,
        startDate: project.startDate ? new Date(project.startDate as string | Date).toISOString().split('T')[0] : "",
        endDate: project.endDate ? new Date(project.endDate as string | Date).toISOString().split('T')[0] : "",
        teamMembers: [],
      });
    } else if (open) {
      form.reset({
        name: "",
        description: "",
        status: "ACTIVE",
        pmId: 0,
        tlId: undefined,
        startDate: "",
        endDate: "",
        teamMembers: [],
      });
    }
  }, [project, open, form]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!open) return;
      setLoadingUsers(true);
      try {
        const [pmRes, tlRes, tmRes] = await Promise.all([
          api.get("/users?role=PM"),
          api.get("/users?role=TL"),
          api.get("/users?role=TM"),
        ]);
        setProjectManagers(pmRes.data.data);
        setTeamLeads(tlRes.data.data);
        setTeamMembers(tmRes.data.data);
        setFilteredTeamMembers(tmRes.data.data);
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

  // Handle TL change to filter team members
  const handleTLChange = (tlId: number | undefined) => {
    if (tlId) {
      const filtered = teamMembers.filter((tm) => tm.managerId === tlId);
      setFilteredTeamMembers(filtered);
    } else {
      setFilteredTeamMembers(teamMembers);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (project?.id) {
      await onUpdate({
        ...(data as UpdateFormData),
        id: project.id,
        pmId: (data as UpdateFormData).pmId ?? undefined,
        tlId: (data as UpdateFormData).tlId ?? undefined,
        startDate: (data as UpdateFormData).startDate ? new Date((data as UpdateFormData).startDate as string) : undefined,
        endDate: (data as UpdateFormData).endDate ? new Date((data as UpdateFormData).endDate as string) : undefined,
        teamMembers: (data as UpdateFormData).teamMembers,
      });
    } else {
      const createData = data as CreateFormData;
      await onSave({
        name: createData.name,
        description: createData.description,
        status: createData.status,
        pmId: createData.pmId ?? undefined,
        tlId: createData.tlId ?? undefined,
        startDate: createData.startDate ? new Date(createData.startDate as string) : undefined,
        endDate: createData.endDate ? new Date(createData.endDate as string) : undefined,
        teamMembers: createData.teamMembers,
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
                  <FieldLabel htmlFor="name">{renderRequired("Project Name")}</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Folder className="h-4 w-4 mt-1" />
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

            <div className="grid grid-cols-3 gap-4">
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

              {/* Project Manager Field */}
              <Controller
                name="pmId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="pmId">Project Manager</FieldLabel>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(value) => field.onChange(Number(value))}
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
                          ) : projectManagers.length === 0 ? (
                            <SelectItem value="no-managers" disabled>
                              No managers available
                            </SelectItem>
                          ) : (
                            projectManagers.map((pm) => (
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
                render={({ field, fieldState }) => (
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
                            teamLeads.map((tl) => (
                              <SelectItem key={tl.id} value={String(tl.id)}>
                                {tl.name}
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
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="startDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
                    <Input
                      {...field}
                      id="startDate"
                      type="date"
                      className="h-10"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="endDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="endDate">End Date</FieldLabel>
                    <Input
                      {...field}
                      id="endDate"
                      type="date"
                      className="h-10"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            {/* Team Members Multi-Select */}
            <Controller
              name="teamMembers"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="teamMembers">Team Members</FieldLabel>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                    {loadingUsers ? (
                      <p className="text-sm text-muted-foreground">Loading team members...</p>
                    ) : filteredTeamMembers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No team members available</p>
                    ) : (
                      filteredTeamMembers.map((tm) => (
                        <label key={tm.id} className="flex items-center gap-2 py-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value?.includes(tm.id) || false}
                            onChange={(e) => {
                              const currentValue = field.value || [];
                              if (e.target.checked) {
                                field.onChange([...currentValue, tm.id]);
                              } else {
                                field.onChange(currentValue.filter((id) => id !== tm.id));
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-sm">{tm.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
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
