import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Invalid email address"),

    password: z.string().trim().min(1, "Password is required")
});


export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters")
        .max(20, "Password must be at most 20 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required").min(8, "Confirm Password must be at least 8 characters")
        .max(20, "Confirm Password must be at most 20 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // attach error to confirmPassword field
});


export const resetPasswordSchema = z.object({
    password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters")
        .max(20, "Password must be at most 20 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required").min(8, "Confirm Password must be at least 8 characters")
        .max(20, "Confirm Password must be at most 20 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // attach error to confirmPassword field
});

export const addUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters")
        .max(20, "Password must be at most 20 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required").min(8, "Confirm Password must be at least 8 characters")
        .max(20, "Confirm Password must be at most 20 characters"),
    role: z.enum(["USER", "ADMIN"]),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // attach error to confirmPassword field
});


export const updateNameSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(70, "Name must not exceed 70 characters")
        .trim(),
});

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
        .string()
        .min(1, "New password is required")
        .min(8, "Password must be at least 8 characters")
        .max(16, "Password must not exceed 16 characters")
        .refine((pw) => /[A-Z]/.test(pw), "Must contain an uppercase letter")
        .refine((pw) => /[a-z]/.test(pw), "Must contain a lowercase letter")
        .refine(
            (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
            "Must contain a special character"
        ),
}).refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"], // This puts the error on the newPassword input
});
