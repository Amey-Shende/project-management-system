import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/ServiceError";
import { z } from "zod";
import {
  createProjectSchema,
  deleteProjectSchema,
  getProjectsSchema,
  updateProjectSchema,
} from "@/validations/projectSchema";
import { formatValidationMessage } from "@/lib/utils";

const projectSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  pmId: true,
  tlId: true,
  startDate: true,
  endDate: true,
  createdAt: true,
  updatedAt: true,
} as const;

type CreateProjectPayload = z.infer<typeof createProjectSchema>;
type UpdateProjectPayload = z.infer<typeof updateProjectSchema>;
type GetProjectsPayload = z.infer<typeof getProjectsSchema>;

export async function getProjectsService(payload: GetProjectsPayload = {}) {
  const parsedPayload = getProjectsSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new ServiceError(formatValidationMessage(parsedPayload.error, "Invalid project query"), 400);
  }

  const { status, pmId, tlId } = parsedPayload.data || {};

  const projects = await prisma.project.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(pmId ? { pmId } : {}),
      ...(tlId ? { tlId } : {}),
    },
    select: {
      ...projectSelect,
      projectManager: {
        select: {
          id: true,
          name: true,
        },
      },
      teamLead: {
        select: {
          id: true,
          name: true,
        },
      },
      members: {
        select: {
          userId: true,
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects;
}

export async function getProjectByIdService(id: number) {
  if (!id || Number.isNaN(id)) {
    throw new ServiceError("Valid project id is required", 400);
  }

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      ...projectSelect,
      projectManager: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      teamLead: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      members: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          assignedAt: true,
        },
        orderBy: {
          assignedAt: "desc",
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  if (!project) {
    throw new ServiceError("Project not found", 404);
  }

  return project;
}

export async function createProjectService(payload: CreateProjectPayload) {
  const parsedPayload = createProjectSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new ServiceError(formatValidationMessage(parsedPayload.error, "Invalid project data"), 400);
  }

  const { name, description, status, pmId, tlId, startDate, endDate, teamMembers } = parsedPayload.data;

  if (pmId) {
    const projectManager = await prisma.user.findUnique({
      where: { id: pmId },
      select: { id: true, role: true },
    });

    if (!projectManager) {
      throw new ServiceError("Project manager not found", 404);
    }

    if (projectManager.role !== "PM") {
      throw new ServiceError("Assigned user must be a Project Manager", 400);
    }
  }

  if (tlId) {
    const teamLead = await prisma.user.findUnique({
      where: { id: tlId },
      select: { id: true, role: true },
    });

    if (!teamLead) {
      throw new ServiceError("Team lead not found", 404);
    }

    if (teamLead.role !== "TL") {
      throw new ServiceError("Assigned user must be a Team Lead", 400);
    }
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      status: status || "ACTIVE",
      ...(pmId ? { pmId } : {}),
      ...(tlId ? { tlId } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(teamMembers && teamMembers.length > 0
        ? {
            members: {
              create: teamMembers.map((userId) => ({
                userId,
              })),
            },
          }
        : {}),
    },
    select: projectSelect,
  });

  // Update TL's managerId to PM if both are set
  if (pmId && tlId) {
    await prisma.user.update({
      where: { id: tlId },
      data: { managerId: pmId },
    });
  }

  return project;
}

export async function updateProjectService(payload: Omit<UpdateProjectPayload, "id">, id: number) {
  const parsedPayload = updateProjectSchema.safeParse({
    ...payload,
    id,
  });

  if (!parsedPayload.success) {
    throw new ServiceError(formatValidationMessage(parsedPayload.error, "Invalid project update data"), 400);
  }

  const { id: parsedId, name, description, status, pmId, tlId, startDate, endDate, teamMembers } = parsedPayload.data;

  const existingProject = await prisma.project.findUnique({
    where: { id: parsedId },
    select: { id: true },
  });

  if (!existingProject) {
    throw new ServiceError("Project not found", 404);
  }

  if (pmId !== undefined) {
    const projectManager = await prisma.user.findUnique({
      where: { id: pmId },
      select: { id: true, role: true },
    });

    if (!projectManager) {
      throw new ServiceError("Project manager not found", 404);
    }

    if (projectManager.role !== "PM") {
      throw new ServiceError("Assigned user must be a Project Manager", 400);
    }
  }

  if (tlId !== undefined) {
    if (tlId === null) {
      // Allow unassigning team lead
    } else {
      const teamLead = await prisma.user.findUnique({
        where: { id: tlId },
        select: { id: true, role: true },
      });

      if (!teamLead) {
        throw new ServiceError("Team lead not found", 404);
      }

      if (teamLead.role !== "TL") {
        throw new ServiceError("Assigned user must be a Team Lead", 400);
      }
    }
  }

  // Handle team members update
  if (teamMembers !== undefined) {
    // Remove existing members
    await prisma.projectMember.deleteMany({
      where: { projectId: parsedId },
    });

    // Add new members if provided
    if (teamMembers.length > 0) {
      await prisma.projectMember.createMany({
        data: teamMembers.map((userId) => ({
          projectId: parsedId,
          userId,
        })),
      });
    }
  }

  const project = await prisma.project.update({
    where: { id: parsedId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(pmId !== undefined ? { pmId } : {}),
      ...(tlId !== undefined ? { tlId } : {}),
      ...(startDate !== undefined ? { startDate } : {}),
      ...(endDate !== undefined ? { endDate } : {}),
    },
    select: projectSelect,
  });

  // Update TL's managerId to PM if both are set
  if (pmId !== undefined && pmId !== null && tlId !== undefined && tlId !== null) {
    await prisma.user.update({
      where: { id: tlId },
      data: { managerId: pmId },
    });
  }

  return project;
}

export async function deleteProjectService(payload: { id: number }) {
  const parsedPayload = deleteProjectSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new ServiceError(formatValidationMessage(parsedPayload.error, "Invalid project id"), 400);
  }

  const { id } = parsedPayload.data;

  const existingProject = await prisma.project.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingProject) {
    throw new ServiceError("Project not found", 404);
  }

  await prisma.project.delete({
    where: { id },
  });

  return { message: "Project deleted successfully" };
}
