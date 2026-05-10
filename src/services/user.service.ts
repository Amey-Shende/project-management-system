import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/ServiceError";
import { number, z } from "zod";
import {
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
  getUsersSchema,
  changePasswordSchema,
} from "@/validations/userSchema";
import { formatValidationMessage } from "@/lib/utils";

// Helper function to get subordinates from ProjectMember
async function getProjectSubordinates(userId: number) {
  const projectSubordinates = await prisma.projectMember.findMany({
    where: {
      managerId: userId,
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  // Remove duplicates by user ID
  const uniqueSubordinates = projectSubordinates.reduce(
    (acc, pm) => {
      if (!acc.find((s) => s.id === pm.user.id)) {
        acc.push(pm.user);
      }
      return acc;
    },
    [] as Array<{ id: number; name: string; email: string; role: string }>,
  );

  return uniqueSubordinates;
}

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

// For Team Member list - adds memberProjects with manager info
const teamMemberListSelect = {
  ...userListSelect,
  memberProjects: {
    select: {
      id: true,
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      manager: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const;

// For Team Lead list - adds memberProjects (filtered for TL role) and subordinates
const teamLeadListSelect = {
  ...userListSelect,
  department: true,
  phone: true,
  skills: true,
  memberProjects: {
    where: {
      role: "TL",
    },
    select: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      manager: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  managedProjects: {
    where: {
      role: "TM",
    },
    select: {
      user: {
        select: {
          id: true,
        },
      },
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
      role: true,
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
      id: true,
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      role: true,
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
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
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {}),
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

    // Fetch project statistics for each PM via ProjectMember
    const usersWithProjectStats = await Promise.all(
      users.map(async (user) => {
        const projectMembers = await prisma.projectMember.findMany({
          where: {
            userId: user.id,
            role: "PM",
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        });

        const projects = projectMembers.map((pm) => pm.project);
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
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
    },
    select: selectObject,
    orderBy: {
      createdAt: "desc",
    },
  });

  // For TLs, calculate unique TM count from managedProjects
  if (role === "TL") {
    const usersWithUniqueTMCount = users.map((user) => {
      const managedProjects = (user as any).managedProjects || [];
      const uniqueTMIds = new Set(
        managedProjects.map((mp: any) => mp?.user?.id).filter(Boolean),
      );
      return {
        ...user,
        _count: {
          managedProjects: uniqueTMIds.size,
        },
      };
    });
    return usersWithUniqueTMCount;
  }

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
    managerIds,
    designation,
    department,
    phone,
    skills,
    assignedProjectIds,
  } = parsedPayload.data;

  // Determine the managerId to store in User table
  // If no projects assigned, use the first manager from managerIds array
  // If projects assigned, managerId will be stored in ProjectMember table instead
  const userTableManagerId =
    (!assignedProjectIds || assignedProjectIds.length === 0) &&
    managerIds &&
    managerIds.length > 0
      ? managerIds[0]
      : managerId;

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new ServiceError("Email already registered", 409);
  }

  if (userTableManagerId) {
    const manager = await prisma.user.findUnique({
      where: { id: userTableManagerId },
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
      managerId: userTableManagerId,
      designation,
      department,
      phone,
      skills: skills || [],
    },
    select: userEditSelect,
  });

  // Handle project assignment based on role
  if (assignedProjectIds && assignedProjectIds.length > 0) {
    if (role === "TM") {
      // Add TM as project member for each project
      await Promise.all(
        assignedProjectIds.map((projectId) =>
          prisma.projectMember.create({
            data: {
              userId: user.id,
              projectId,
              role: "TM",
              managerId:
                managerIds && managerIds.length > 0 ? managerIds[0] : undefined,
            },
          }),
        ),
      );
    } else if (role === "TL") {
      // Add TL as project member via ProjectMember for each project
      await Promise.all(
        assignedProjectIds.map((projectId) =>
          prisma.projectMember.create({
            data: {
              userId: user.id,
              projectId,
              role: "TL",
              managerId:
                managerIds && managerIds.length > 0 ? managerIds[0] : undefined,
            },
          }),
        ),
      );
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
    managerIds,
    designation,
    department,
    phone,
    skills,
    assignedProjectIds,
  } = parsedPayload.data;

  // Determine the managerId to store in User table
  // If no projects assigned, use the first manager from managerIds array
  // If projects assigned, managerId will be stored in ProjectMember table instead
  const userTableManagerId =
    (!assignedProjectIds || assignedProjectIds.length === 0) &&
    managerIds &&
    managerIds.length > 0
      ? managerIds[0]
      : managerId;

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

  if (userTableManagerId !== undefined && userTableManagerId !== null) {
    if (userTableManagerId === parsedId) {
      throw new ServiceError("User cannot be their own manager", 400);
    }

    const manager = await prisma.user.findUnique({
      where: { id: userTableManagerId },
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
      ...(userTableManagerId !== undefined
        ? { managerId: userTableManagerId }
        : {}),
      ...(designation !== undefined ? { designation } : {}),
      ...(department !== undefined ? { department } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(skills !== undefined ? { skills } : {}),
    },
    select: userEditSelect,
  });

  // Handle project assignment based on role
  if (assignedProjectIds !== undefined) {
    if (role === "TM") {
      // Remove existing project memberships for TM role
      await prisma.projectMember.deleteMany({
        where: { userId: parsedId, role: "TM" },
      });

      // Add new project assignments if provided
      if (assignedProjectIds.length > 0) {
        await Promise.all(
          assignedProjectIds.map((projectId) =>
            prisma.projectMember.create({
              data: {
                userId: parsedId,
                projectId,
                role: "TM",
                managerId:
                  managerIds && managerIds.length > 0
                    ? managerIds[0]
                    : undefined,
              },
            }),
          ),
        );
      }
    } else if (role === "TL") {
      // Remove user from any projects they were TL of
      await prisma.projectMember.deleteMany({
        where: {
          userId: parsedId,
          role: "TL",
        },
      });

      // Assign TL to new projects if provided
      if (assignedProjectIds.length > 0) {
        await Promise.all(
          assignedProjectIds.map((projectId) =>
            prisma.projectMember.create({
              data: {
                userId: parsedId,
                projectId,
                role: "TL",
                managerId:
                  managerIds && managerIds.length > 0
                    ? managerIds[0]
                    : undefined,
              },
            }),
          ),
        );
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

  // Get subordinates from ProjectMember (project-specific managers)
  const projectSubordinates = await getProjectSubordinates(id);

  // Combine subordinates from User table and ProjectMember, removing duplicates
  const allSubordinates = [
    ...(user.subordinates || []),
    ...projectSubordinates,
  ].reduce(
    (acc, sub) => {
      if (!acc.find((s) => s.id === sub.id)) {
        acc.push(sub);
      }
      return acc;
    },
    [] as Array<{ id: number; name: string; email: string }>,
  );

  return {
    ...user,
    subordinates: allSubordinates,
  };
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
    where: { id },
    include: {
      members: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
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
