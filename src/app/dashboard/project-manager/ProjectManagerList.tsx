"use client";

import Table, { TableColumn } from "@/components/Table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { ProjectMangerFilter } from "./ProjectManagerFilter";
import { PMDialog } from "./PMDialog";
import { Mail, UserRound } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { generateColor } from "@/lib/utils";

const columns: TableColumn<User>[] = [
  {
    key: "name",
    label: "Name",
    width: "w-[20%]", // ← adjust freely
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
          <p className="truncate text-sm font-semibold">{user.name}</p>
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
    width: "w-[30%]",
    renderCell: (user) => (
      <p className="flex items-center gap-2 truncate text-sm">
        <Mail className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
        <span className="truncate">{user.email}</span>
      </p>
    ),
  },
  {
    key: "active_projects",
    label: "Active Projects",
    width: "w-[10%]",
    renderCell: () => (
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
        5
      </div>
    ),
  },
  {
    key: "manager",
    label: "Report TO",
    width: "w-[15%]",
    renderCell: () => (
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
        2
      </div>
    ),
  },
  {
    key: "team_size",
    label: "Team size",
    width: "w-[10%]",
    renderCell: () => (
      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold`}
      >
        10
      </div>
    ),
  },
  {
    key: "action",
    label: "Actions",
    width: "w-[10%]",
    align: "center",
  },
];
export interface User extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  role: "PM" | "TM" | "TL" | "CEO";
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
