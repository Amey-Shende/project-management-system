"use client";

import Table, { TableColumn } from "@/components/Table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { ProjectFilter } from "./ProjectFilter";
import { ProjectDialog } from "./ProjectDialog";
import { Briefcase, User, Users, Calendar } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import Link from "next/link";
import { generateColor } from "@/lib/utils";

export interface Project extends Record<string, unknown> {
  id: number;
  name: string;
  description: string | null;
  status: "ACTIVE" | "COMPLETED";
  pmId?: number | null;
  tlId?: number | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  projectManager?: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  teamLead?: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  _count?: {
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
    renderCell: (project) => (
      <div className="flex items-center gap-2">
        {project.projectManager?.name ? (
          <>
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{
                backgroundColor: generateColor(project.projectManager?.name, project.projectManager?.id),
              }}
            >
              {project.projectManager?.name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "PM"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {project.projectManager?.name || "Not assigned"}
              </p>
            </div>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Not assigned</span>
        )}
      </div>
    ),
  },
  {
    key: "teamLead",
    label: "Team Lead",
    width: "w-[17%]",
    renderCell: (project) => (
      <div className="flex items-center gap-2">
        {project.teamLead?.name ? (
          <>
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{ backgroundColor: generateColor(project.teamLead?.name, project.teamLead?.id) }}
            >
              {project.teamLead?.name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "TL"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {project.teamLead?.name || "Not assigned"}
              </p>
            </div>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Not assigned</span>
        )}
      </div>
    ),
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
  // {
  //   key: "startDate",
  //   label: "Start Date",
  //   width: "w-[10%]",
  //   renderCell: (project) => (
  //     <div className="text-sm text-muted-foreground">
  //       {project.startDate
  //         ? new Date(project.startDate as string).toLocaleDateString("en-GB", {
  //             day: "2-digit",
  //             month: "2-digit",
  //             year: "numeric",
  //           })
  //         : "-"}
  //     </div>
  //   ),
  // },
  // {
  //   key: "endDate",
  //   label: "End Date",
  //   width: "w-[10%]",
  //   renderCell: (project) => (
  //     <div className="text-sm text-muted-foreground">
  //       {project.endDate
  //         ? new Date(project.endDate as string).toLocaleDateString("en-GB", {
  //             day: "2-digit",
  //             month: "2-digit",
  //             year: "numeric",
  //           })
  //         : "-"}
  //     </div>
  //   ),
  // },
  {
    key: "updatedAt",
    label: "Updated",
    width: "w-[10%]",
    renderCell: (project) => (
      <div className="text-sm text-muted-foreground">
        {project.updatedAt
          ? new Date(project.updatedAt as string).toLocaleDateString("en-GB", {
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
  const [projects, setProjects] = useState<Project[]>(initialData);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pmFilter, setPMFilter] = useState("all");
  const [projectManagers, setProjectManagers] = useState<Array<{ id: number; name: string }>>([]);

  console.log("initialData", initialData);

  const fetchProjects = async (filters?: { search?: string; status?: string; pmId?: string }) => {
    try {
      const params = new URLSearchParams();
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
      let fetchedProjects = res.data.data;
      
      // Client-side search filtering
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        fetchedProjects = fetchedProjects.filter((project: Project) =>
          project.name.toLowerCase().includes(searchLower) ||
          (project.description && project.description.toLowerCase().includes(searchLower))
        );
      }
      
      setProjects(fetchedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    }
  };

  const fetchProjectManagers = async () => {
    try {
      const res = await api.get("/users?role=PM");
      if (res.status !== 200) throw new Error("Failed to fetch project managers");
      setProjectManagers(res.data.data);
    } catch (error) {
      console.error("Error fetching project managers:", error);
    }
  };

  useEffect(() => {
    fetchProjectManagers();
  }, []);

  const handleUpdateProject = async (projectData: {
    id: number;
    name?: string;
    description?: string;
    status?: "ACTIVE" | "COMPLETED";
    pmId?: number;
    tlId?: number;
    startDate?: Date;
    endDate?: Date;
    teamMembers?: number[];
  }) => {
    try {
      const { id, ...data } = projectData;
      const res = await api.patch(`/project/${id}`, data);
      if (res.status !== 200) throw new Error("Failed to update project");
      await fetchProjects({ search: searchQuery, status: statusFilter, pmId: pmFilter });
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
      await fetchProjects({ search: searchQuery, status: statusFilter, pmId: pmFilter });
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
    pmId?: number;
    tlId?: number;
    startDate?: Date;
    endDate?: Date;
    teamMembers?: number[];
  }) => {
    try {
      const res = await api.post("/project", projectData);
      if (res.status !== 201) throw new Error("Failed to create project");
      const data = res.data.data;
      setProjects([data, ...projects]);
      toast.success("Project created successfully");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    fetchProjects({ search: value, status: statusFilter, pmId: pmFilter });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    fetchProjects({ search: searchQuery, status: value, pmId: pmFilter });
  };

  const handlePMChange = (value: string) => {
    setPMFilter(value);
    fetchProjects({ search: searchQuery, status: statusFilter, pmId: value });
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleAddProject = () => {
    setEditingProject(undefined);
    setIsDialogOpen(true);
  };

  return (
    <section>
      <div className="p-2.5 h-[calc(100vh-6rem)]">
        <Card className="p-4 h-[calc(100vh-6rem)] bg-white">
          <CardHeader>
            <ProjectFilter
              onAddProject={handleAddProject}
              onSearchChange={handleSearchChange}
              onStatusChange={handleStatusChange}
              onPMChange={handlePMChange}
              searchValue={searchQuery}
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
      />
    </section>
  );
}

export default ProjectList;
