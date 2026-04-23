"use client";

import Table, { TableColumn } from "@/components/Table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { ProjectMangerFilter } from "./ProjectManagerFilter";
import { PMDialog } from "./PMDialog";
import { Mail, UserRound, Users, Briefcase } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { generateColor } from "@/lib/utils";
import Link from "next/link";

const columns: TableColumn<User>[] = [
  {
    key: "name",
    label: "Name",
    width: "w-[20%]",
    minWidth: "min-w-[130px]",
    renderCell: (user) => (
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{ background: generateColor(user.name, user.id) }}
        >
          {user.name
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div className="min-w-0">
          <Link
            href={`/dashboard/project-manager/${user.id}`}
            className="truncate text-sm font-semibold hover:underline"
          >
            {user.name}
          </Link>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <UserRound className="h-3.5 w-3.5" /> Project Manager
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "email",
    label: "Email",
    width: "w-[25%]",
    renderCell: (user) => (
      <p className="flex items-center gap-2 truncate text-sm">
        <Mail className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
        <span className="truncate">{user.email}</span>
      </p>
    ),
  },
  {
    key: "teamLeadsCount",
    label: "Team Leads",
    width: "w-[12%]",
    renderCell: (user) => (
      <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        <Users className="h-3.5 w-3.5" />
        {user.subordinates?.length || 0}
      </div>
    ),
  },
  {
    key: "projectsCount",
    label: "Total Projects",
    width: "w-[10%]",
    renderCell: (user) => (
      <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
        <Briefcase className="h-3.5 w-3.5" />
        {(user as any).totalProjects || 0}
      </div>
    ),
  },
  {
    key: "activeProjects",
    label: "Active",
    width: "w-[10%]",
    renderCell: (user) => (
      <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        {(user as any).activeProjects || 0}
      </div>
    ),
  },
  {
    key: "completedProjects",
    label: "Completed",
    width: "w-[10%]",
    renderCell: (user) => (
      <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
        {(user as any).completedProjects || 0}
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
export interface User extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  role: "PM" | "TM" | "TL" | "CEO";
  subordinates?: Array<{ id: number; name: string }>;
  managedProjects?: Array<{ id: number; name: string; status: string }>;
  totalProjects?: number;
  activeProjects?: number;
  completedProjects?: number;
}

interface ProjectManagerListProps {
  initialData: User[]; // This matches what you are passing
}

function ProjectManagerList({ initialData }: ProjectManagerListProps) {
  const [users, setUsers] = useState<User[]>(initialData);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleUpdateUser = async (user: {
    id: number;
    name: string;
    email: string;
    role: "PM";
    password?: string;
    designation?: string;
    department?: string;
    phone?: string;
  }) => {
    try {
      const { password, id, ...userData } = user;
      const res = await api.patch(`/users/${user.id}`, userData);
      if (res.status !== 200) throw new Error("Failed to update user");
      const data = res.data.data;
      setUsers(users.map((u) => (u.id === user.id ? data : u)));
      toast.success("Project manager updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update project manager");
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const res = await api.delete(`/users/${user.id}`);
      if (res.status !== 200) throw new Error("Failed to delete user");
      setUsers(users.filter((u) => u.id !== user.id));
      toast.success("Project manager deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete project manager");
    }
  };

  const handleCreateUser = async (user: {
    name: string;
    email: string;
    role: "PM";
    password: string;
    designation?: string;
    department?: string;
    phone?: string;
  }) => {
    try {
      const res = await api.post("/users", { ...user, role: "PM" });
      if (res.status !== 201) throw new Error("Failed to create user");
      const data = res.data.data;
      setUsers([data, ...users]);
      toast.success("Project manager created successfully");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create project manager");
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleAddUser = () => {
    setEditingUser(undefined);
    setIsDialogOpen(true);
  };

  return (
    <section>
      <div className="p-2.5 h-[calc(100vh-6rem)]">
        <Card className="p-4 h-[calc(100vh-6rem)] bg-white">
          <CardHeader>
            <ProjectMangerFilter onAddUser={handleAddUser} />
          </CardHeader>
          <CardContent className="">
            <Table<User>
              columns={columns}
              data={users}
              onEdit={handleEditClick}
              onDelete={handleDeleteUser}
              deleteDialog={{
                title: "Are you sure you want to delete this Project Manager?",
                description: (row) =>
                  `"${row.name}" will be removed permanently.`,
              }}
            />
          </CardContent>
        </Card>
      </div>
      <PMDialog
        user={editingUser}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleCreateUser}
        onUpdate={handleUpdateUser}
      />
    </section>
  );
}

export default ProjectManagerList;
