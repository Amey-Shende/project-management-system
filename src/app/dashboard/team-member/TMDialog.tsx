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
import {
  UserIcon,
  MailIcon,
  Building2,
  Briefcase,
  Code2,
  PhoneIcon,
  FolderKanban,
  UserRound,
} from "lucide-react";
import { z } from "zod";
import { renderRequired } from "@/lib/renderRequired";
import api from "@/lib/axios";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const baseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().min(1, "Email is required").email(),
  role: z.literal("TM"),
  password: z.string().optional(),
  designation: z
    .string()
    .trim()
    .max(50, "Designation must be less than 50 characters")
    .optional(),
  department: z
    .string()
    .trim()
    .max(50, "Department must be less than 50 characters")
    .optional(),
  phone: z.string().max(10, "Phone must be at most 10 digit").optional(),
  skills: z.string().optional(),
  assignedProjectId: z.number().nullable().optional(),
  managerId: z.number().nullable().optional(),
});

interface TMDialogProps {
  user?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userData: {
    name: string;
    email: string;
    role: "TM";
    password: string;
    designation?: string;
    department?: string;
    phone?: string;
    skills?: string[];
    assignedProjectId?: number | null;
    managerId?: number | null;
  }) => void;
  onUpdate: (userData: {
    id: number;
    name: string;
    email: string;
    role: "TM";
    password?: string;
    designation?: string;
    department?: string;
    phone?: string;
    skills?: string[];
    assignedProjectId?: number | null;
    managerId?: number | null;
  }) => void;
}

export function TMDialog({
  user,
  open,
  onOpenChange,
  onSave,
  onUpdate,
}: TMDialogProps) {
  const [projects, setProjects] = useState<
    { id: number; name: string; teamLead?: { id: number; name: string } }[]
  >([]);
  const [teamLeads, setTeamLeads] = useState<{ id: number; name: string }[]>([]);
  const formSchema = baseSchema;
  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      role: "TM",
      password: "",
      designation: "",
      department: "",
      phone: "",
      skills: "",
      assignedProjectId: undefined,
      managerId: undefined,
    },
  });

  useEffect(() => {
    if (user && open) {
      form.reset({
        name: user.name,
        email: user.email,
        role: "TM",
        password: "",
        designation: user.designation || "",
        department: user.department || "",
        phone: user.phone || "",
        skills: user.skills?.join(", ") || "",
        assignedProjectId:
          user.memberProjects?.[0]?.project?.id ||
          (user as any).assignedProjectId,
        managerId: user.managerId,
      });
    } else if (open) {
      form.reset({
        name: "",
        email: "",
        role: "TM",
        password: "",
        designation: "",
        department: "",
        phone: "",
        skills: "",
        assignedProjectId: undefined,
        managerId: undefined,
      });
    }
  }, [user, open, form]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Both requests start at the same time
        const [projectRes, teamleadRes] = await Promise.all([
          api.get("/project"),
          api.get("/users?role=TL"),
        ]);
        if (projectRes.status === 200) setProjects(projectRes.data.data);
        if (teamleadRes.status === 200) setTeamLeads(teamleadRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  const assignedProjectId = form.watch("assignedProjectId");

  useEffect(() => {
    // TODO: Add any additional logic here if needed
    if (assignedProjectId && open) {
      const project = projects.find((p) => p.id === assignedProjectId);
      const managerId = project?.teamLead?.id;
      form.setValue("managerId", managerId);
    }
  }, [assignedProjectId, open]);

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = (data: FormData) => {
    const { password, ...rest } = data;
    const payload = {
      ...rest,
      password: password && password.trim() ? password : undefined,
      skills: data.skills
        ? data.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
    };

    if (user?.id) {
      onUpdate({ ...payload, id: user.id });
    } else {
      onSave(payload as any);
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="xs:max-w-[400px] sm:max-w-[600px] md:max-w-[800px] ">
        <DialogHeader>
          <DialogTitle>
            {user ? "Update Team Member" : "Add Team Member"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Update the team member details below."
              : "Fill in the details to add a new team member."}
          </DialogDescription>
        </DialogHeader>

        <form id="tm-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{renderRequired("Name")}</FieldLabel>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      className="pl-10 h-10"
                      placeholder="Enter name"
                      aria-invalid={fieldState.invalid}
                    />
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Email */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{renderRequired("Email")}</FieldLabel>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="email"
                      className="pl-10 h-10"
                      placeholder="Enter email"
                      aria-invalid={fieldState.invalid}
                    />
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Designation */}
            <Controller
              name="designation"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Designation</FieldLabel>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      className="pl-10 h-10"
                      placeholder="Enter designation"
                      aria-invalid={fieldState.invalid}
                    />
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Department */}
            <Controller
              name="department"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Department</FieldLabel>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      className="pl-10 h-10"
                      placeholder="Enter department"
                      aria-invalid={fieldState.invalid}
                    />
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Phone */}
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Phone</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <PhoneIcon className="h-4 w-4 mt-1" />
                    </span>
                    <Input
                      {...field}
                      type="tel"
                      className="h-10 pl-10"
                      placeholder="Enter phone"
                      aria-invalid={fieldState.invalid}
                      onInput={(e) => {
                        const input = e.target as HTMLInputElement;
                        input.value = input.value.replace(/[^0-9]/g, "");
                      }}
                    />
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Skills */}
            <Controller
              name="skills"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="skills">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4" />
                      Skills (comma separated)
                    </div>
                  </FieldLabel>
                  <Input
                    {...field}
                    className="h-10"
                    placeholder="Add skills like React, JavaScript, HTML5"
                    value={field.value}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Assigned Project */}
            <Controller
              name="assignedProjectId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Assigned Project</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                      <FolderKanban className="h-4 w-4 mt-1" />
                    </span>
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) =>
                        field.onChange(val ? Number(val) : undefined)
                      }
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectTrigger className="h-10! pl-10 w-full">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Projects</SelectLabel>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Manager/Team Lead */}
            <Controller
              name="managerId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Reports To</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                      <UserRound className="h-4 w-4 mt-1" />
                    </span>
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) =>
                        field.onChange(val ? Number(val) : undefined)
                      }
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectTrigger className="h-10! pl-10 w-full">
                        <SelectValue placeholder="Select team lead" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Team Leads</SelectLabel>
                          {teamLeads?.map((tl) => (
                            <SelectItem key={tl.id} value={String(tl.id)}>
                              {tl.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
            form="tm-form"
            disabled={isSubmitting}
            className="h-10 w-24"
          >
            {isSubmitting ? "Saving..." : user ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
