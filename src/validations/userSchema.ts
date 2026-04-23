import { Role } from "../../generated/prisma/enums";
import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(70, "Name must not exceed 70 characters"),
    email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
    password: z.string().trim().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
    role: z.nativeEnum(Role),
    designation: z.string().trim().max(50).optional(),
    department: z.string().trim().max(50).optional(),
    phone: z.string().trim().max(20).optional(),
    skills: z.array(z.string()).optional(),
    managerId: z.number().optional(),
    assignedProjectId: z.number().optional(),
});

export const updateUserSchema = z.object({
    id: z.number().int().positive("User id is required"),
    name: z.string().trim().min(1, "Name is required").max(70, "Name must not exceed 70 characters").optional(),
    email: z.string().trim().email("Invalid email address").optional(),
    password: z.string().trim().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters").optional(),
    role: z.nativeEnum(Role).optional(),
    managerId: z.number().int().positive().nullable().optional(),
    designation: z.string().trim().max(50).optional(),
    department: z.string().trim().max(50).optional(),
    phone: z.string().trim().max(20).optional(),
    skills: z.array(z.string()).optional(),
    assignedProjectId: z.number().int().positive().nullable().optional(),
}).refine(
    (data) =>
        data.name !== undefined ||
        data.email !== undefined ||
        data.password !== undefined ||
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


