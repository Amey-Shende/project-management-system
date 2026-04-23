import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/ServiceError";
import { z } from "zod";
import { createUserSchema, deleteUserSchema, getUsersSchema, updateUserSchema } from "@/validations/userSchema";
import { formatValidationMessage } from "@/lib/utils";

const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    managerId: true,
    designation: true,
    department: true,
    phone: true,
    skills: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    manager: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
    memberProjects: {
        select: {
            project: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
} as const;

const userWithProjectsSelect = {
    ...userSelect,
    manager: {
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    },
    memberProjects: {
        select: {
            project: {
                select: {
                    id: true,
                    name: true,
                    projectManager: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    },
} as const;

type CreateUserPayload = z.infer<typeof createUserSchema>;
type UpdateUserPayload = z.infer<typeof updateUserSchema>;
type GetUsersPayload = z.infer<typeof getUsersSchema>;


export async function getUsersService(payload: GetUsersPayload = {}) {
    const parsedPayload = getUsersSchema.safeParse(payload);

    if (!parsedPayload.success) {
        throw new ServiceError(formatValidationMessage(parsedPayload.error, "Invalid user query"), 400);
    }
    const { role } = parsedPayload.data;

    const users = await prisma.user.findMany({
        where: {
            ...(role ? { role } : {}),
        },
        select: userSelect,
        orderBy: {
            createdAt: "desc",
        },
    });

    return users
}

export async function createUserService(payload: CreateUserPayload) {
    const parsedPayload = createUserSchema.safeParse(payload);

    if (!parsedPayload.success) {
        throw new ServiceError(formatValidationMessage(parsedPayload.error, "Invalid user data"), 400);
    }

    const { name, email, password, role, managerId, designation, department, phone, skills, assignedProjectId } = parsedPayload.data;

    const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (existingUser) {
        throw new ServiceError("Email already registered", 409);
    }

    if (managerId) {
        const manager = await prisma.user.findUnique({
            where: { id: managerId },
            select: { id: true },
        });

        if (!manager) {
            throw new ServiceError("Manager not found", 404);
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
            managerId,
            designation,
            department,
            phone,
            skills: skills || [],
        },
        select: userSelect,
    });

    // If assignedProjectId is provided, add user to project as member
    if (assignedProjectId && role === "TM") {
        await prisma.projectMember.create({
            data: {
                userId: user.id,
                projectId: assignedProjectId,
            },
        });
    }

    return user;
}

export async function updateUserService(payload: Omit<UpdateUserPayload, "id">, id: number) {
    const parsedPayload = updateUserSchema.safeParse({
        ...payload,
        id,
    });

    if (!parsedPayload.success) {
        throw new ServiceError(formatValidationMessage(parsedPayload.error, "Invalid user update data"), 400);
    }

    const { id: parsedId, name, email, password, role, managerId, designation, department, phone, skills, assignedProjectId } = parsedPayload.data;

    const existingUser = await prisma.user.findUnique({
        where: { id: parsedId },
        select: { id: true, email: true },
    });

    if (!existingUser) {
        throw new ServiceError("User not found", 404);
    }

    if (email && email !== existingUser.email) {
        const emailOwner = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (emailOwner) {
            throw new ServiceError("Email already registered", 409);
        }
    }

    if (managerId !== undefined && managerId !== null) {
        if (managerId === parsedId) {
            throw new ServiceError("User cannot be their own manager", 400);
        }

        const manager = await prisma.user.findUnique({
            where: { id: managerId },
            select: { id: true },
        });

        if (!manager) {
            throw new ServiceError("Manager not found", 404);
        }
    }

    const user = await prisma.user.update({
        where: { id: parsedId },
        data: {
            ...(name !== undefined ? { name } : {}),
            ...(email !== undefined ? { email } : {}),
            ...(password !== undefined ? { password: await bcrypt.hash(password, 10) } : {}),
            ...(role !== undefined ? { role } : {}),
            ...(managerId !== undefined ? { managerId } : {}),
            ...(designation !== undefined ? { designation } : {}),
            ...(department !== undefined ? { department } : {}),
            ...(phone !== undefined ? { phone } : {}),
            ...(skills !== undefined ? { skills } : {}),
        },
        select: userSelect,
    });

    // Handle project assignment for TM role
    if (assignedProjectId !== undefined) {
        // Remove existing project memberships
        await prisma.projectMember.deleteMany({
            where: { userId: parsedId },
        });

        // Add new project assignment if provided
        if (assignedProjectId !== null) {
            await prisma.projectMember.create({
                data: {
                    userId: parsedId,
                    projectId: assignedProjectId,
                },
            });
        }
    }

    return user;
}

export async function getUserByIdService(id: number) {
    const user = await prisma.user.findUnique({
        where: { id },
        select: userWithProjectsSelect,
    });

    if (!user) {
        throw new ServiceError("User not found", 404);
    }

    return user;
}

export async function deleteUserService(payload: { id: number }) {
    const parsedPayload = deleteUserSchema.safeParse(payload);

    if (!parsedPayload.success) {
        throw new ServiceError(formatValidationMessage(parsedPayload.error, "Invalid user id"), 400);
    }

    const { id } = parsedPayload.data;

    const existingUser = await prisma.user.findUnique({
        where: { id },
        select: { id: true },
    });

    if (!existingUser) {
        throw new ServiceError("User not found", 404);
    }

    await prisma.user.delete({
        where: { id },
    });

    return { message: "User deleted successfully" };
}
