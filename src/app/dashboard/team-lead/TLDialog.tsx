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
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  Briefcase,
  PhoneIcon,
  FolderKanban,
  UserRound,
} from "lucide-react";
import { z } from "zod";
import { renderRequired } from "@/lib/renderRequired";
import api from "@/lib/axios";
import { MultiSelect } from "@/components/MultiSelect";

const baseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().min(1, "Email is required").email(),
  role: z.literal("TL"),
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
  assignedProjectIds: z.array(z.number()).optional(),
  managerIds: z.array(z.number()).optional(),
});

const updateSchema = baseSchema.extend({
  password: z.string().trim().min(6).optional().or(z.literal("")),
});

const createSchema = baseSchema.extend({
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at most 20 characters"),
});

interface TLDialogProps {
  user?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userData: {
    name: string;
    email: string;
    role: "TL";
    password: string;
    designation?: string;
    department?: string;
    phone?: string;
    skills?: string[];
    managerIds?: number[];
    assignedProjectIds?: number[];
  }) => void;
  onUpdate: (userData: {
    id: number;
    name: string;
    email: string;
    role: "TL";
    password?: string;
    designation?: string;
    department?: string;
    phone?: string;
    skills?: string[];
    managerIds?: number[];
    assignedProjectIds?: number[];
  }) => void;
}

const getManagerIds = (user: any) => {
  if (user?.memberProjects && user?.memberProjects?.length > 0) {
    const result = user?.memberProjects?.map((mp: any) => mp?.manager?.id);
    const set = new Set(result);
    return Array.from(set);
  }
  return user?.managerId ? [user.managerId] : [];
};

export function TLDialog({
  user,
  open,
  onOpenChange,
  onSave,
  onUpdate,
}: TLDialogProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [projectManagers, setProjectManagers] = useState<
    { id: number; name: string }[]
  >([]);
  const [projects, setProjects] = useState<
    {
      id: number;
      name: string;
      members:[ { user: { id: number; name: string; role: string } } | null];
    }[]
  >([]);
  const isEditMode = !!user?.id;
  const formSchema = user ? updateSchema : createSchema;
  type FormData = z.infer<typeof formSchema>;
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      role: "TL",
      password: "",
      designation: "",
      department: "",
      phone: "",
      skills: "",
      managerIds: [],
      assignedProjectIds: [],
    },
  });

  useEffect(() => {
    if (user && open) {
      form.reset({
        name: user.name,
        email: user.email,
        role: "TL",
        password: "",
        designation: user.designation || "",
        department: user.department || "",
        phone: user.phone || "",
        skills: user.skills?.join(", ") || "",
        assignedProjectIds:
          user.memberProjects?.map((mp: any) => mp.project.id) || [],
        managerIds: getManagerIds(user) as number[],
      });
    } else if (open) {
      form.reset({
        name: "",
        email: "",
        role: "TL",
        password: "",
        designation: "",
        department: "",
        phone: "",
        skills: "",
        managerIds: [],
        assignedProjectIds: [],
      });
    }
  }, [user, open, form]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Both requests start at the same time
        const [projectRes, projectMangerRes] = await Promise.all([
          api.get("/project"),
          api.get("/users?role=PM"),
        ]);
        if (projectRes.status === 200) setProjects(projectRes.data?.data);
        if (projectMangerRes.status === 200)
          setProjectManagers(projectMangerRes.data?.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  const assignedProjectIds = form.watch("assignedProjectIds");

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      skills:
        typeof data.skills === "string"
          ? data.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : data.skills,
    };

    if (user?.id) {
      onUpdate({ ...payload, id: user.id });
      // console.log(payload);
    } else {
      onSave(payload as any);
    }
    onOpenChange(false);
    form.reset();
  };

  useEffect(() => {
    if (assignedProjectIds && assignedProjectIds.length > 0 && open) {
      const selectedProjects = projects.filter((project) => assignedProjectIds.includes(project.id));
      const managerIds = selectedProjects
        ?.flatMap((project) =>
          project.members
            ?.filter((member) => member?.user?.role === "PM")
            .map((member) => member?.user?.id)
        )
        .filter((id): id is number => id !== undefined);
      form.setValue("managerIds", managerIds);
    } 
  }, [assignedProjectIds, open, projects, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="xs:max-w-[400px] sm:max-w-[600px] md:max-w-[800px] ">
        <DialogHeader>
          <DialogTitle>
            {user ? "Update Team Lead" : "Add Team Lead"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Update the team lead details below."
              : "Fill in the details to add a new team lead."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="tl-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-1"
        >
          <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">
                    {renderRequired("Name")}
                  </FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <UserIcon className="h-4 w-4 mt-1" />
                    </span>
                    <Input
                      {...field}
                      id="name"
                      placeholder="Enter name"
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                      className="h-10 pl-10"
                    />
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">
                    {renderRequired("Email")}
                  </FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <MailIcon className="h-4 w-4 mt-1" />
                    </span>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      className="h-10 pl-10"
                    />
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {!isEditMode && (
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="relative">
                    <FieldLabel htmlFor="password">
                      {renderRequired("Password")}
                    </FieldLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <LockIcon className="h-4 w-4" />
                      </span>
                      <Input
                        {...field}
                        id="password"
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="Enter password"
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                        className="h-10 pr-10 pl-10"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2">
                        {isPasswordVisible ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => setIsPasswordVisible(false)}
                            className="h-6 w-6 p-0 active:bg-transparent hover:bg-transparent"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => setIsPasswordVisible(true)}
                            className="h-6 w-6 p-0 active:bg-transparent hover:bg-transparent"
                          >
                            <EyeOffIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </span>
                    </div>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            )}
            <Controller
              name="designation"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="designation">Designation</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Briefcase className="h-4 w-4 mt-1" />
                    </span>
                    <Input
                      {...field}
                      id="designation"
                      placeholder="Enter designation"
                      aria-invalid={fieldState.invalid}
                      className="h-10 pl-10"
                    />
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <PhoneIcon className="h-4 w-4 mt-1" />
                    </span>
                    <Input
                      {...field}
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      aria-invalid={fieldState.invalid}
                      className="h-10 pl-10"
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
                      {/* <Code2 className="h-4 w-4" /> */}
                      Key Expertise (comma separated)
                    </div>
                  </FieldLabel>
                  <Input
                    {...field}
                    className="h-10"
                    placeholder="Add key expertise like React, JavaScript"
                    value={field.value}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="assignedProjectIds"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Assign Projects</FieldLabel>
                  <MultiSelect
                    options={projects.map((p) => ({
                      value: p.id,
                      label: p.name,
                    }))}
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select projects"
                    selectLabel="Projects"
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Manager/Project Manager */}
            <Controller
              name="managerIds"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Report To (Project Managers)</FieldLabel>
                  <MultiSelect
                    options={projectManagers.map((pm) => ({
                      value: pm.id,
                      label: pm.name,
                    }))}
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select project managers"
                    selectLabel="Project Managers"
                  />
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
            form="tl-form"
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
