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
  Building2,
  Briefcase,
  PhoneIcon,
} from "lucide-react";
import { z } from "zod";
import { renderRequired } from "@/lib/renderRequired";

const baseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().min(1, "Email is required").email(),
  role: z.literal("PM"),
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
});

const createSchema = baseSchema.extend({
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at most 20 characters"),
});

const updateSchema = baseSchema.extend({
  password: z.string().trim().min(6).optional().or(z.literal("")),
});

interface PMDialogProps {
  user?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userData: {
    name: string;
    email: string;
    role: "PM";
    password: string;
    designation?: string;
    department?: string;
    phone?: string;
  }) => void;
  onUpdate: (userData: {
    id: number;
    name: string;
    email: string;
    role: "PM";
    password?: string;
    designation?: string;
    department?: string;
    phone?: string;
  }) => void;
}

export function PMDialog({
  user,
  open,
  onOpenChange,
  onSave,
  onUpdate,
}: PMDialogProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
      designation: "",
      department: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (user && open) {
      form.reset({
        name: user.name,
        email: user.email,
        role: "PM",
        password: "",
        designation: user.designation || "",
        department: user.department || "",
        phone: user.phone || "",
      });
    } else if (open) {
      form.reset({
        name: "",
        email: "",
        role: "PM",
        password: "",
        designation: "",
        department: "",
        phone: "",
      });
    }
  }, [user, open, form]);

  const {
    handleSubmit,
    formState: { isSubmitting },
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
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {user ? "Update Project Manager" : "Add Project Manager"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Update the project manager details below."
              : "Fill in the details to add a new project manager."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="pm-form"
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
              name="department"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="department">Department</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Building2 className="h-4 w-4 mt-1" />
                    </span>
                    <Input
                      {...field}
                      id="department"
                      placeholder="Enter department"
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
            form="pm-form"
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
