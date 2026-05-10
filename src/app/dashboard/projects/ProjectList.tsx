"use client";
import Table, { TableColumn } from "@/components/Table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { ProjectFilter } from "./ProjectFilter";
import { ProjectDialog } from "./ProjectDialog";
import { Users } from "lucide-react";
import Link from "next/link";
import { generateColor } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { TeamAvatars } from "@/components/TeamAvatars";
import { toast } from "sonner";
import api from "@/lib/axios";

export interface Project extends Record<string, unknown> {
  id: number;
  name: string;
  description: string | null;
  status: "ACTIVE" | "COMPLETED";
  updatedAt: Date;
  techstack?: unknown;
  members: Array<{
    user: {
      id: number;
      name: string;
      role: string;
    };
    role: string;
  }>;
  _count: {
    members: number;
  };
}

export interface ProjectFull extends Record<string, unknown> {
  id: number;
  name: string;
  description: string | null;
  status: "ACTIVE" | "COMPLETED";
  techstack?: unknown;
  priority: "LOW" | "MEDIUM" | "HIGH";
  startDate: Date | null;
  endDate: Date | null;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
    role: string;
    assignedAt: Date;
  }>;
  _count: {
    members: number;
  };
}

const columns: TableColumn<Project>[] = [
  {
    key: "name",
    label: "Project Name",
    width: "w-[20%]",
    minWidth: "min-w-[120px]",
    renderCell: (project) => (
      <div className="flex items-center gap-3">
        <div className="min-w-0 max-w-[200px] truncate">
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="truncate text-sm font-semibold  hover:underline"
          >
            {project.name}
          </Link>
          {project.description && (
            <p className="truncate max-w-[170px] text-xs text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    width: "w-[10%]",
    renderCell: (project) => (
      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
          project.status === "ACTIVE"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {project.status === "ACTIVE" ? "Active" : "Completed"}
      </div>
    ),
  },
  {
    key: "projectManager",
    label: "Project Manager",
    width: "w-[17%]",
    renderCell: (project) => {
      const pm = project.members?.filter((m: any) => m.role === "PM")?.map((m: any) => m.user);
      return (
        <TeamAvatars
          members={pm || []}
          emptyMessage="Not assigned"
          showNameWhenSingle={true}
          size="sm"
        />
      );
    },
  },
  {
    key: "teamLead",
    label: "Team Lead",
    width: "w-[17%]",
    renderCell: (project) => {
      const tl = project.members
        ?.filter((m: any) => m.role === "TL")
        ?.map((m: any) => m.user);
      return (
        <TeamAvatars
          members={tl || []}
          emptyMessage="Not assigned"
          showNameWhenSingle={true}
          size="sm"
        />
      );
    },
  },
  {
    key: "teamSize",
    label: "Team Size",
    width: "w-[10%]",
    renderCell: (project) => (
      <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        <Users className="h-3.5 w-3.5" />
        {project._count?.members || 0}
      </div>
    ),
  },
  {
    key: "updatedAt",
    label: "Updated",
    width: "w-[10%]",
    renderCell: (project) => (
      <div className="text-sm text-muted-foreground">
        {project.updatedAt
          ? new Date(project.updatedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "-"}
      </div>
    ),
  },
  {
    key: "action",
    label: "Actions",
    width: "w-[8%]",
    align: "center",
  },
];

interface ProjectListProps {
  initialData: Project[];
}

function ProjectList({ initialData }: ProjectListProps) {
  const searchParams = useSearchParams();
  const searchbox = searchParams.get("search");
  const [projects, setProjects] = useState<Project[]>(initialData);
  const [editingProject, setEditingProject] = useState<
    ProjectFull | undefined
  >();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pmFilter, setPMFilter] = useState("all");
  const [projectManagers, setProjectManagers] = useState<
    Array<{ id: number; name: string }>
  >([]);

  const fetchProjects = async (filters?: {
    search?: string;
    status?: string;
    pmId?: string;
  }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) {
        params.append("search", filters.search);
      }
      if (filters?.status && filters.status !== "all") {
        params.append("status", filters.status);
      }
      if (filters?.pmId && filters.pmId !== "all") {
        params.append("pmId", filters.pmId);
      }
      const queryString = params.toString();
      const url = queryString ? `/project?${queryString}` : "/project";
      const res = await api.get(url);
      if (res.status !== 200) throw new Error("Failed to fetch projects");
      setProjects(res.data.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    }
  };

  const fetchProjectManagers = async () => {
    try {
      const res = await api.get("/users?role=PM");
      if (res.status !== 200)
        throw new Error("Failed to fetch project managers");
      setProjectManagers(res.data.data);
    } catch (error) {
      console.error("Error fetching project managers:", error);
    }
  };

  // Refetch projects when search params change
  useEffect(() => {
    fetchProjects({
      search: searchbox || undefined,
      status: statusFilter,
      pmId: pmFilter,
    });
  }, [searchbox]);

  useEffect(() => {
    fetchProjectManagers();
  }, []);

  const handleUpdateProject = async (projectData: {
    id: number;
    name?: string;
    description?: string;
    status?: "ACTIVE" | "COMPLETED";
    pmIds?: number[];
    tlIds?: number[];
    startDate?: Date;
    endDate?: Date;
    teamMembers?: number[];
  }) => {
    try {
      const res = await api.patch(`/project/${projectData.id}`, projectData);
      if (res.status !== 200) throw new Error("Failed to update project");
      await fetchProjects({
        search: searchParams.get("search") || undefined,
        status: statusFilter,
        pmId: pmFilter,
      });
      toast.success("Project updated successfully");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    }
  };

  const handleDeleteProject = async (project: Project) => {
    try {
      const res = await api.delete(`/project/${project.id}`);
      if (res.status !== 200) throw new Error("Failed to delete project");
      await fetchProjects({
        search: searchParams.get("search") || undefined,
        status: statusFilter,
        pmId: pmFilter,
      });
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const handleCreateProject = async (projectData: {
    name: string;
    description?: string;
    status?: "ACTIVE" | "COMPLETED";
    pmIds?: number[];
    tlIds?: number[];
    startDate?: Date;
    endDate?: Date;
    teamMembers?: number[];
  }) => {
    try {
      const res = await api.post("/project", projectData);
      if (res.status !== 201) throw new Error("Failed to create project");
      setProjects([res.data.data as Project, ...projects]);
      toast.success("Project created successfully");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    }
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    fetchProjects({
      search: searchParams.get("search") || undefined,
      status: value,
      pmId: pmFilter,
    });
  };

  const handlePMChange = (value: string) => {
    setPMFilter(value);
    fetchProjects({
      search: searchParams.get("search") || undefined,
      status: statusFilter,
      pmId: value,
    });
  };

  const handleEditClick = async (project: Project) => {
    try {
      const res = await api.get(`/project/${project.id}`);
      if (res.status !== 200)
        throw new Error("Failed to fetch project details");
      setEditingProject(res.data.data);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching project details:", error);
      toast.error("Failed to load project details");
    }
  };

  const handleAddProject = () => {
    setEditingProject(undefined);
    setIsDialogOpen(true);
  };

  return (
    <section>
      <div className="p-2.5 h-[calc(100vh-6rem)]">
        <Card className="p-4 h-[calc(100vh-6rem)] bg-white overflow-hidden">
          <CardHeader>
            <ProjectFilter
              onAddProject={handleAddProject}
              onStatusChange={handleStatusChange}
              onPMChange={handlePMChange}
              statusValue={statusFilter}
              pmValue={pmFilter}
              projectManagers={projectManagers}
            />
          </CardHeader>
          <CardContent className="">
            <Table<Project>
              columns={columns}
              data={projects}
              onEdit={handleEditClick}
              onDelete={handleDeleteProject}
              deleteDialog={{
                title: "Are you sure you want to delete this Project?",
                description: (row) =>
                  `"${row.name}" will be removed permanently.`,
              }}
            />
          </CardContent>
        </Card>
      </div>
      <ProjectDialog
        project={editingProject}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleCreateProject}
        onUpdate={handleUpdateProject}
        addDialog={{
          title: "Add Project",
          description: "Add a new project to the system",
          updateTitle: "Update Project",
          updateDescription: "Update the project information",
        }}
        projectManagers={projectManagers}
      />
    </section>
  );
}

export default ProjectList;
