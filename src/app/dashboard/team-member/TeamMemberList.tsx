"use client";
import Table, { TableColumn } from "@/components/Table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { TeamMemberFilter } from "./TeamMemberFilter";
import { TMDialog } from "./TMDialog";
import { Mail, UserRound, Briefcase, FolderKanban } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { generateColor } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
          style={{ backgroundColor: generateColor(user.name, user.id) }}
        >
          {user.name
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div className="min-w-0 truncate max-w-[176px]">
          <Link
            href={`/dashboard/team-member/${user.id}`}
            className="truncate text-sm font-semibold hover:underline"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate">{user.name}</span>
              </TooltipTrigger>
              {user.name.length > 23 && (
                <TooltipContent>
                  <p>{user.name}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </Link>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <UserRound className="h-3.5 w-3.5" /> Team Member
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "email",
    label: "Email",
    width: "w-[22%]",
    renderCell: (user) => (
      <p className="flex items-center gap-2 truncate text-sm">
        <Mail className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
        <span className="truncate">{user.email}</span>
      </p>
    ),
  },
  {
    key: "teamLead",
    label: "Team Lead",
    width: "w-[15%]",
    renderCell: (user) => {
      const manager = user.manager;
      if (!manager) {
        return <div className="text-sm text-center pr-4">-</div>;
      }
      return (
        <span className="text-sm">{manager.name}</span>
      );
    },
  },
  {
    key: "projectCount",
    label: "Project Count",
    width: "w-[12%]",
    renderCell: (user) => (
      <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
        <FolderKanban className="h-3.5 w-3.5" />
        {user.memberProjects?.length || 0}
      </div>
    ),
  },
  {
    key: "Designation",
    label: "Designation",
    width: "w-[15%]",
    renderCell: (user) => (
      <div className="inline-flex items-center rounded-full px-3 py-1 text-sm">
        {user.designation || "Software Engineer"}
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
  designation?: string | null;
  department?: string | null;
  phone?: string | null;
  skills?: unknown;
  isActive: boolean;
  assignedProjectId?: number | null;
  managerId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  memberProjects?: Array<{ 
    project: {
      id: number;
      name?: string;
    };
  }>;
  manager?: {
    id: number;
    name?: string;
    email?: string;
  } | null;
}

interface TeamMemberListProps {
  initialData: User[];
}

function TeamMemberList({ initialData }: TeamMemberListProps) {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const [users, setUsers] = useState<User[]>(initialData);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      params.append("role", "TM");
      if (search) params.append("search", search);
      const queryString = params.toString();
      const url = queryString ? `/users?${queryString}` : "/users?role=TM";
      const res = await api.get(url);
      if (res.status !== 200) throw new Error("Failed to fetch users");
      setUsers(res.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleUpdateUser = async (userData: {
    id: number;
    name: string;
    email: string;
    role: "TM";
    password?: string;
    assignedProjectId?: number | null;
    managerId?: number | null;
    designation?: string;
    department?: string;
    phone?: string;
    skills?: string[];
  }) => {
    try {
      const { password, id, ...data } = userData;
      const res = await api.patch(`/users/${id}`, data);
      if (res.status !== 200) throw new Error("Failed to update user");
      toast.success("Team member updated successfully");
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update team member");
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const res = await api.delete(`/users/${user.id}`);
      if (res.status !== 200) throw new Error("Failed to delete user");
      toast.success("Team member deleted successfully");
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete team member");
    }
  };

  const handleCreateUser = async (userData: {
    name: string;
    email: string;
    role: "TM";
    password: string;
    assignedProjectId?: number | null;
    managerId?: number | null;
    designation?: string;
    department?: string;
    phone?: string;
    skills?: string[];
  }) => {
    try {
      const res = await api.post("/users", { ...userData, role: "TM" });
      if (res.status !== 201) throw new Error("Failed to create user");
      toast.success("Team member created successfully");
      console.log(res);
      await fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create team member");
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
        <Card className="p-4 h-[calc(100vh-6rem)] bg-white overflow-hidden">
          <CardHeader>
            <TeamMemberFilter onAddUser={handleAddUser} />
          </CardHeader>
          <CardContent className="">
            <TooltipProvider>
              <Table<User>
                columns={columns}
                data={users}
                onEdit={handleEditClick}
                onDelete={handleDeleteUser}
                deleteDialog={{
                  title: "Are you sure you want to delete this Team Member?",
                  description: (row) =>
                    `"${row.name}" will be removed permanently.`,
                }}
              />
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>
      <TMDialog
        user={editingUser}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleCreateUser}
        onUpdate={handleUpdateUser}
      />
    </section>
  );
}

export default TeamMemberList;
