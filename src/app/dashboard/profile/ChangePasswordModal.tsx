"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(20, "New password must be at most 20 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>;

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({
  open,
  onOpenChange,
}: ChangePasswordModalProps) {
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordFormSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onChangePassword = async (data: ChangePasswordFormData) => {
    try {
      await api.post("/users/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success("Password changed successfully");
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to change password";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and a new password to change your
            password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onChangePassword)}>
          <FieldGroup className="space-y-0">
            <Controller
              name="currentPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="currentPassword">
                    Current Password
                  </FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                      <LockIcon className="h-4 w-4" />
                    </span>
                    <Input
                      {...field}
                      id="currentPassword"
                      type={isCurrentPasswordVisible ? "text" : "password"}
                      placeholder="Enter your current password"
                      className="pl-10 h-10 pr-10"
                      aria-invalid={fieldState.invalid}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                      {isCurrentPasswordVisible ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsCurrentPasswordVisible(false)}
                          type="button"
                          className="active:bg-transparent hover:bg-transparent"
                        >
                          <EyeIcon />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsCurrentPasswordVisible(true)}
                          type="button"
                          className="active:bg-transparent hover:bg-transparent"
                        >
                          <EyeOffIcon />
                        </Button>
                      )}
                    </span>
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                      <LockIcon className="h-4 w-4" />
                    </span>
                    <Input
                      {...field}
                      id="newPassword"
                      type={isNewPasswordVisible ? "text" : "password"}
                      placeholder="Enter your new password"
                      className="pl-10 h-10 pr-10"
                      aria-invalid={fieldState.invalid}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                      {isNewPasswordVisible ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsNewPasswordVisible(false)}
                          type="button"
                          className="active:bg-transparent hover:bg-transparent"
                        >
                          <EyeIcon />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsNewPasswordVisible(true)}
                          type="button"
                          className="active:bg-transparent hover:bg-transparent"
                        >
                          <EyeOffIcon />
                        </Button>
                      )}
                    </span>
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm Password
                  </FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                      <LockIcon className="h-4 w-4" />
                    </span>
                    <Input
                      {...field}
                      id="confirmPassword"
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      placeholder="Confirm your new password"
                      className="pl-10 h-10 pr-10"
                      aria-invalid={fieldState.invalid}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                      {isConfirmPasswordVisible ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsConfirmPasswordVisible(false)}
                          type="button"
                          className="active:bg-transparent hover:bg-transparent"
                        >
                          <EyeIcon />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsConfirmPasswordVisible(true)}
                          type="button"
                          className="active:bg-transparent hover:bg-transparent"
                        >
                          <EyeOffIcon />
                        </Button>
                      )}
                    </span>
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Change Password</Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
