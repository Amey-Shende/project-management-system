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
  techstack: true,
  priority: true,
  startDate: true,
  endDate: true,
  progress: true,
  createdAt: true,
  updatedAt: true,
} as const;

type CreateProjectPayload = z.infer<typeof createProjectSchema>;
type UpdateProjectPayload = z.infer<typeof updateProjectSchema>;
type GetProjectsPayload = z.infer<typeof getProjectsSchema>;

export async function getProjectsService(payload: GetProjectsPayload = {}) {
  const parsedPayload = getProjectsSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new ServiceError(
      formatValidationMessage(parsedPayload.error, "Invalid project query"),
      400,
    );
  }

  const { status, pmId, tlId, search } = parsedPayload.data || {};

  // Build where clause
  const where: any = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {}),
  };

  // Filter by PM role in ProjectMember
  if (pmId) {
    where.members = {
      some: {
        userId: pmId,
        role: "PM",
      },
    };
  }

  // Filter by TL role in ProjectMember
  if (tlId) {
    where.members = {
      some: {
        userId: tlId,
        role: "TL",
      },
    };
  }

  const projects = await prisma.project.findMany({
    where,
    select: {
      ...projectSelect,
      members: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          role: true,
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
      members: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          role: true,
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
    throw new ServiceError(
      formatValidationMessage(parsedPayload.error, "Invalid project data"),
      400,
    );
  }

  const {
    name,
    description,
    status,
    pmIds,
    tlIds,
    teamMembers,
    startDate,
    endDate,
    techstack,
    priority,
  } = parsedPayload.data;

  // Validate PMs
  if (pmIds && pmIds.length > 0) {
    const projectManagers = await prisma.user.findMany({
      where: { id: { in: pmIds } },
      select: { id: true, role: true },
    });

    if (projectManagers.length !== pmIds.length) {
      throw new ServiceError("One or more project managers not found", 404);
    }

    const invalidPM = projectManagers.find((pm) => pm.role !== "PM");
    if (invalidPM) {
      throw new ServiceError("Assigned user must be a Project Manager", 400);
    }
  }

  // Validate TLs
  if (tlIds && tlIds.length > 0) {
    const teamLeads = await prisma.user.findMany({
      where: { id: { in: tlIds } },
      select: { id: true, role: true },
    });

    if (teamLeads.length !== tlIds.length) {
      throw new ServiceError("One or more team leads not found", 404);
    }

    const invalidTL = teamLeads.find((tl) => tl.role !== "TL");
    if (invalidTL) {
      throw new ServiceError("Assigned user must be a Team Lead", 400);
    }
  }

  // Validate TMs
  if (teamMembers && teamMembers.length > 0) {
    const teamMembersData = await prisma.user.findMany({
      where: { id: { in: teamMembers } },
      select: { id: true, role: true },
    });

    if (teamMembersData.length !== teamMembers.length) {
      throw new ServiceError("One or more team members not found", 404);
    }

    const invalidTM = teamMembersData.find((tm) => tm.role !== "TM");
    if (invalidTM) {
      throw new ServiceError("Assigned user must be a Team Member", 400);
    }
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      techstack: techstack,
      status: status || "ACTIVE",
      priority: priority || "MEDIUM",
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      members: {
        create: [
          ...(pmIds || []).map((userId: number) => ({
            userId,
            role: "PM" as const,
          })),
          ...(tlIds || []).map((userId: number) => ({
            userId,
            role: "TL" as const,
            managerId: pmIds && pmIds.length > 0 ? pmIds[0] : null,
          })),
          ...(teamMembers || []).map((userId: number) => ({
            userId,
            role: "TM" as const,
            managerId: tlIds && tlIds.length > 0 ? tlIds[0] : null,
          })),
        ],
      },
    },
    select: projectSelect,
  });

  return project;
}

export async function updateProjectService(
  payload: Omit<UpdateProjectPayload, "id">,
  id: number,
) {
  const parsedPayload = updateProjectSchema.safeParse({
    ...payload,
    id,
  });

  if (!parsedPayload.success) {
    throw new ServiceError(
      formatValidationMessage(
        parsedPayload.error,
        "Invalid project update data",
      ),
      400,
    );
  }

  const {
    id: parsedId,
    name,
    description,
    status,
    pmIds,
    tlIds,
    teamMembers,
    startDate,
    endDate,
    techstack,
    priority,
  } = parsedPayload.data;

  const existingProject = await prisma.project.findUnique({
    where: { id: parsedId },
    select: { id: true },
  });

  if (!existingProject) {
    throw new ServiceError("Project not found", 404);
  }

  // Validate PMs
  if (pmIds !== undefined) {
    const projectManagers = await prisma.user.findMany({
      where: { id: { in: pmIds } },
      select: { id: true, role: true },
    });

    if (projectManagers.length !== pmIds.length) {
      throw new ServiceError("One or more project managers not found", 404);
    }

    const invalidPM = projectManagers.find((pm) => pm.role !== "PM");
    if (invalidPM) {
      throw new ServiceError("Assigned user must be a Project Manager", 400);
    }
  }

  // Validate TLs
  if (tlIds !== undefined) {
    const teamLeads = await prisma.user.findMany({
      where: { id: { in: tlIds } },
      select: { id: true, role: true },
    });

    if (teamLeads.length !== tlIds.length) {
      throw new ServiceError("One or more team leads not found", 404);
    }

    const invalidTL = teamLeads.find((tl) => tl.role !== "TL");
    if (invalidTL) {
      throw new ServiceError("Assigned user must be a Team Lead", 400);
    }
  }

  // Validate TMs
  if (teamMembers !== undefined && teamMembers.length > 0) {
    const teamMembersData = await prisma.user.findMany({
      where: { id: { in: teamMembers } },
      select: { id: true, role: true },
    });

    if (teamMembersData.length !== teamMembers.length) {
      throw new ServiceError("One or more team members not found", 404);
    }

    const invalidTM = teamMembersData.find((tm) => tm.role !== "TM");
    if (invalidTM) {
      throw new ServiceError("Assigned user must be a Team Member", 400);
    }
  }

  // Handle PM update
  if (pmIds !== undefined) {
    // Remove existing PMs from this project
    await prisma.projectMember.deleteMany({
      where: {
        projectId: parsedId,
        role: "PM",
      },
    });

    // Add new PMs
    if (pmIds.length > 0) {
      await prisma.projectMember.createMany({
        data: pmIds.map((userId: number) => ({
          projectId: parsedId,
          userId,
          role: "PM",
        })),
      });
    }
  }

  // Handle TL update
  if (tlIds !== undefined) {
    // Remove existing TLs from this project
    await prisma.projectMember.deleteMany({
      where: {
        projectId: parsedId,
        role: "TL",
      },
    });

    // Add new TLs with managerId set to PM
    if (tlIds.length > 0) {
      // Get the first PM for this project
      const projectPM = await prisma.projectMember.findFirst({
        where: {
          projectId: parsedId,
          role: "PM",
        },
        select: { userId: true },
      });

      await prisma.projectMember.createMany({
        data: tlIds.map((userId: number) => ({
          projectId: parsedId,
          userId,
          role: "TL",
          managerId: projectPM?.userId || null,
        })),
      });
    }
  }

  // Handle team members update
  if (teamMembers !== undefined) {
    // Remove existing TMs from current project
    await prisma.projectMember.deleteMany({
      where: {
        projectId: parsedId,
        role: "TM",
      },
    });

    // Add new members to current project
    if (teamMembers.length > 0) {
      // Get the first TL for this project
      const projectTL = await prisma.projectMember.findFirst({
        where: {
          projectId: parsedId,
          role: "TL",
        },
        select: { userId: true },
      });

      // Add new members to current project with managerId set to TL
      await prisma.projectMember.createMany({
        data: teamMembers.map((userId) => ({
          projectId: parsedId,
          userId,
          role: "TM",
          managerId: projectTL?.userId || null,
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
      ...(startDate !== undefined ? { startDate } : {}),
      ...(endDate !== undefined ? { endDate } : {}),
      ...(techstack !== undefined ? { techstack } : {}),
      ...(priority !== undefined ? { priority } : {}),
    },
    select: projectSelect,
  });

  return project;
}

export async function deleteProjectService(payload: { id: number }) {
  const parsedPayload = deleteProjectSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new ServiceError(
      formatValidationMessage(parsedPayload.error, "Invalid project id"),
      400,
    );
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
