import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/ServiceError";
import { z } from "zod";
import {
  changePasswordSchema,
  createUserSchema,
  deleteUserSchema,
  getUsersSchema,
  updateUserSchema,
} from "@/validations/userSchema";
import { formatValidationMessage } from "@/lib/utils";

// Optimized select for list views - only essential fields
const userListSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  managerId: true,
  designation: true,
  isActive: true,
  manager: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

// For Team Member list - adds memberProjects
const teamMemberListSelect = {
  ...userListSelect,
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

// For Team Lead list - adds leadProjects and subordinates
const teamLeadListSelect = {
  ...userListSelect,
  department: true,
  phone: true,
  skills: true,
  leadProjects: {
    select: {
      id: true,
      name: true,
    },
  },
  subordinates: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

// For Project Manager list - adds subordinates
const projectManagerListSelect = {
  ...userListSelect,
  subordinates: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

// For edit dialogs - all editable fields
const userEditSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  managerId: true,
  designation: true,
  department: true,
  phone: true,
  skills: true,
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
  leadProjects: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

// For detail pages - comprehensive data
const userDetailSelect = {
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
  leadProjects: {
    select: {
      id: true,
      name: true,
    },
  },
  subordinates: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

// For profile page - personal data only
const userProfileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  managerId: true,
  designation: true,
  department: true,
  phone: true,
  skills: true,
  createdAt: true,
  updatedAt: true,
  manager: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

type CreateUserPayload = z.infer<typeof createUserSchema>;
type UpdateUserPayload = z.infer<typeof updateUserSchema>;
type GetUsersPayload = z.infer<typeof getUsersSchema>;

export async function getUsersService(payload: GetUsersPayload = {}) {
  const parsedPayload = getUsersSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new ServiceError(
      formatValidationMessage(parsedPayload.error, "Invalid user query"),
      400,
    );
  }
  const { role, search } = parsedPayload.data;

  // For Project Managers, fetch with project statistics from project table
  if (role === "PM") {
    const users = await prisma.user.findMany({
      where: {
        role: "PM",
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        isActive: true,
        manager: {
          select: {
            id: true,
            name: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch project statistics for each PM
    const usersWithProjectStats = await Promise.all(
      users.map(async (user) => {
        const projects = await prisma.project.findMany({
          where: { pmId: user.id },
          select: {
            id: true,
            name: true,
            status: true,
          },
        });

        const activeProjects = projects.filter(
          (p) => p.status === "ACTIVE",
        ).length;
        const completedProjects = projects.filter(
          (p) => p.status === "COMPLETED",
        ).length;

        return {
          ...user,
          managedProjects: projects,
          totalProjects: projects.length,
          activeProjects,
          completedProjects,
        };
      }),
    );

    return usersWithProjectStats;
  }

  // For other roles, use optimized select based on role
  let selectObject;
  if (role === "TM") {
    selectObject = teamMemberListSelect;
  } else if (role === "TL") {
    selectObject = teamLeadListSelect;
  } else {
    selectObject = userListSelect;
  }

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      } : {}),
    },
    select: selectObject,
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
}

export async function createUserService(payload: CreateUserPayload) {
  const parsedPayload = createUserSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new ServiceError(
      formatValidationMessage(parsedPayload.error, "Invalid user data"),
      400,
    );
  }

  const {
    name,
    email,
    password,
    role,
    managerId,
    designation,
    department,
    phone,
    skills,
    assignedProjectId,
  } = parsedPayload.data;

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

  let hashedPassword: string | null = null;
  if (password && role !== "TM") {
    hashedPassword = await bcrypt.hash(password, 10);
  }
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
    select: userEditSelect,
  });

  // Handle project assignment based on role
  if (assignedProjectId) {
    if (role === "TM") {
      // Add TM as project member
      await prisma.projectMember.create({
        data: {
          userId: user.id,
          projectId: assignedProjectId,
          role: "TM",
        },
      });
    } else if (role === "TL") {
      // Assign TL to project via tlId
      await prisma.project.update({
        where: { id: assignedProjectId },
        data: {
          tlId: user.id,
          pmId: user.managerId,
        },
      });
    }
  }

  return user;
}

export async function updateUserService(
  payload: Omit<UpdateUserPayload, "id">,
  id: number,
) {
  const parsedPayload = updateUserSchema.safeParse({
    ...payload,
    id,
  });

  if (!parsedPayload.success) {
    throw new ServiceError(
      formatValidationMessage(parsedPayload.error, "Invalid user update data"),
      400,
    );
  }

  const {
    id: parsedId,
    name,
    email,
    role,
    managerId,
    designation,
    department,
    phone,
    skills,
    assignedProjectId,
  } = parsedPayload.data;

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
      ...(role !== undefined ? { role } : {}),
      ...(managerId !== undefined ? { managerId } : {}),
      ...(designation !== undefined ? { designation } : {}),
      ...(department !== undefined ? { department } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(skills !== undefined ? { skills } : {}),
    },
    select: userEditSelect,
  });

  // Handle project assignment based on role
  if (assignedProjectId !== undefined) {
    if (role === "TM") {
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
    } else if (role === "TL") {
      // Remove user from any projects they were TL of
      await prisma.project.updateMany({
        where: { tlId: parsedId },
        data: { tlId: null },
      });

      // Assign TL to new project if provided
      if (assignedProjectId !== null) {
        await prisma.project.update({
          where: { id: assignedProjectId },
          data: {
            tlId: parsedId,
            pmId: managerId,
          },
        });
      }
    }
  }

  return user;
}

export async function getUserByIdService(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userDetailSelect,
  });

  if (!user) {
    throw new ServiceError("User not found", 404);
  }

  return user;
}

export async function getUserProfileService(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userProfileSelect,
  });

  if (!user) {
    throw new ServiceError("User not found", 404);
  }

  return user;
}

export async function deleteUserService(payload: { id: number }) {
  const parsedPayload = deleteUserSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new ServiceError(
      formatValidationMessage(parsedPayload.error, "Invalid user id"),
      400,
    );
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

export async function getProjectManagerDetailService(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      subordinates: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          subordinates: {
            where: {
              isActive: true,
            },
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!user || user.role !== "PM") {
    throw new ServiceError("Project Manager not found", 404);
  }

  // Fetch projects managed by this PM
  const projects = await prisma.project.findMany({
    where: { pmId: id },
    include: {
      teamLead: {
        select: {
          id: true,
          name: true,
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

  return {
    ...user,
    projects,
    activeProjects: projects.filter((p) => p.status === "ACTIVE").length,
    completedProjects: projects.filter((p) => p.status === "COMPLETED").length,
  };
}

export async function changePasswordService(
  payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  },
  userId: number,
) {
  const parsedPayload = changePasswordSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new ServiceError(
      formatValidationMessage(parsedPayload.error, "Invalid password data"),
      400,
    );
  }

  const { currentPassword, newPassword } = parsedPayload.data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) {
    throw new ServiceError("User not found", 404);
  }

  if (!user.password) {
    throw new ServiceError("User password not found", 404);
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password,
  );

  if (!isCurrentPasswordValid) {
    throw new ServiceError("Current password is incorrect", 400);
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return { message: "Password changed successfully" };
}
