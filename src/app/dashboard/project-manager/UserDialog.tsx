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
} from "lucide-react";
import { User } from "./ProjectManagerList";
import { z } from "zod";
import { renderRequired } from "@/lib/renderRequired";
import api from "@/lib/axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const baseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  role: z.enum(["PM", "TM", "TL", "CEO"]),
  assignedProjectId: z.number().optional(),
});

// For creation: Password is required
const createSchema = baseSchema.extend({
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at most 20 characters"),
});

// For update: Password is optional
const updateSchema = baseSchema.extend({
  password: z.string().trim().min(6).optional().or(z.literal("")),
});

interface UserDialogProps {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userData: {
    name: string;
    email: string;
    role: "PM" | "TM" | "TL" | "CEO";
    password: string;
    assignedProjectId?: number;
  }) => void;
  onUpdate: (userData: {
    id: number;
    name: string;
    email: string;
    role: "PM" | "TM" | "TL" | "CEO";
    password?: string;
    assignedProjectId?: number;
  }) => void;
  addDialog?: {
    title: string;
    description: string;
    updateTitle?: string;
    updateDescription?: string;
  };
}

export function UserDialog({
  user,
  open,
  onOpenChange,
  onSave,
  onUpdate,
  addDialog,
}: UserDialogProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const isEditMode = !!user?.id;
  const formSchema = user ? updateSchema : createSchema;
  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      role: "PM",
      password: "",
    },
  });

  const { watch } = form;
  const selectedRole = watch("role");

  useEffect(() => {
    if (user && open) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "", // Always reset password in edit mode
        assignedProjectId: (user as any).assignedProjectId,
      });
    } else if (open) {
      form.reset({
        name: "",
        email: "",
        role: "TM", // Default for team members
        password: "",
        assignedProjectId: undefined,
      });
    }
  }, [user, open, form]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        if (res.status === 200) {
          setProjects(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    if (open) {
      fetchProjects();
    }
  }, [open]);

  const {
    handleSubmit,
    formState: { isSubmitting },
    formState: { errors },
  } = form;

  const onSubmit = (data: FormData) => {
    if (user?.id) {
      onUpdate({ ...data, id: user.id });
    } else {
      onSave(data as any);
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user ? addDialog?.updateTitle : addDialog?.title}
          </DialogTitle>
          <DialogDescription>
            {user
              ? addDialog?.updateDescription ||
                "Update the team member details below."
              : addDialog?.description ||
                "Fill in the details to add a new team member."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="user-form"
          onSubmit={handleSubmit(onSubmit, (errors) =>
            console.log("Validation Errors:", errors),
          )}
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
                  <FieldLabel htmlFor="name">{renderRequired("Name")}</FieldLabel>
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

            {/* Email Field */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">{renderRequired("Email")}</FieldLabel>
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

            {/* Password Field - Only show in create mode */}
            {!isEditMode && (
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="relative">
                    <FieldLabel htmlFor="password">{renderRequired("Password")}</FieldLabel>
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

            {/* Assigned Project Field - Only show for TM role */}
            {selectedRole === "TM" && (
              <Controller
                name="assignedProjectId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="assignedProjectId">Assigned Project</FieldLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                      value={field.value ? String(field.value) : ""}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={String(project.id)}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            )}
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
            form="user-form"
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
