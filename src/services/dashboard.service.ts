import { prisma } from "@/lib/prisma";

export async function getDashboardStatsService() {
  const [
    totalProjects,
    activeProjects,
    completedProjects,
    totalPM,
    totalTL,
    totalTM,
    projectsByMonth,
    projectStatusDistribution,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.project.count({ where: { status: "COMPLETED" } }),
    prisma.user.count({ where: { role: "PM", isActive: true } }),
    prisma.user.count({ where: { role: "TL", isActive: true } }),
    prisma.user.count({ where: { role: "TM", isActive: true } }),
    prisma.project.findMany({
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.project.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    }),
  ]);

  // Calculate projects by month for growth chart
  const monthlyData = new Map<string, { active: number; completed: number }>();
  
  projectsByMonth.forEach((project) => {
    const date = new Date(project.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { active: 0, completed: 0 });
    }
    
    const data = monthlyData.get(monthKey)!;
    if (project.status === "ACTIVE") {
      data.active++;
    } else if (project.status === "COMPLETED") {
      data.completed++;
    }
  });

  const projectGrowth = Array.from(monthlyData.entries())
    .map(([month, counts]) => ({
      month,
      ...counts,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    totalPM,
    totalTL,
    totalTM,
    projectStatusDistribution: projectStatusDistribution.map((item) => ({
      status: item.status,
      count: item._count.status,
    })),
    projectGrowth,
  };
}

export async function getOrganizationHierarchyService() {
  const projectManagers = await prisma.user.findMany({
    where: {
      role: "PM",
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

  return projectManagers;
}
