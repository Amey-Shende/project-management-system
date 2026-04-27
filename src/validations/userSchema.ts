import { Role } from "../../generated/prisma/enums";
import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(50, "Name must not exceed 50 characters"),
    email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
    password: z.string().trim().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters").optional(),
    role: z.nativeEnum(Role),
    designation: z.string().trim().max(50).optional(),
    department: z.string().trim().max(50).optional(),
    phone: z.string().trim().max(20).optional(),
    skills: z.array(z.string()).optional(),
    managerId: z.number().nullable().optional(),
    assignedProjectId: z.number().nullable().optional(),
}).refine(
    (data) => data.role !== "TM" || !data.password,
    {
        message: "Password is not required for TM role",
        path: ["password"],
    }
).refine(
    (data) => data.role === "TM" || !!data.password,
    {
        message: "Password is required for this role",
        path: ["password"],
    }
);

export const updateUserSchema = z.object({
    id: z.number().int().positive("User id is required"),
    name: z.string().trim().min(1, "Name is required").max(50, "Name must not exceed 50 characters").optional(),
    email: z.string().trim().email("Invalid email address").optional(),
    role: z.nativeEnum(Role).optional(),
    managerId: z.number().nullable().optional(),
    designation: z.string().trim().max(50).optional(),
    department: z.string().trim().max(50).optional(),
    phone: z.string().trim().max(20).optional(),
    skills: z.array(z.string()).optional(),
    assignedProjectId: z.number().nullable().optional(),
}).refine(
    (data) =>
        data.name !== undefined ||
        data.email !== undefined ||
        data.role !== undefined ||
        data.managerId !== undefined ||
        data.designation !== undefined ||
        data.department !== undefined ||
        data.phone !== undefined ||
        data.skills !== undefined ||
        data.assignedProjectId !== undefined,
    {
        message: "At least one field is required to update the user",
        path: ["id"],
    },
);

export const deleteUserSchema = z.object({
    id: z.number().int().positive("User id is required"),
});

export const getUsersSchema = z.object({
    id: z.number().int().positive().optional(),
    role: z.nativeEnum(Role).optional(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().trim().min(1, "Current password is required"),
    newPassword: z.string().trim().min(6, "New password must be at least 6 characters").max(20, "New password must be at most 20 characters"),
    confirmPassword: z.string().trim().min(1, "Confirm password is required"),
}).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);


