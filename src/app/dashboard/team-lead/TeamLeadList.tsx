"use client";
import Table, { TableColumn } from "@/components/Table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { TeamLeadFilter } from "./TeamLeadFilter";
import { TLDialog } from "./TLDialog";
import { Mail, UserRound, Briefcase, Users, FolderKanban } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { generateColor } from "@/lib/utils";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSearchParams } from "next/navigation";

const columns: TableColumn<User>[] = [
  {
    key: "name",
    label: "Name",
    width: "w-[18%]",
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
        <div className="min-w-0 truncate max-w-[176px]">
          <Link
            href={`/dashboard/team-lead/${user.id}`}
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
            <UserRound className="h-3.5 w-3.5" /> Team Lead
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "email",
    label: "Email",
    width: "w-[20%]",
    renderCell: (user) => (
      <p className="flex items-center gap-2 truncate text-sm">
        <Mail className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
        <span className="truncate">{user.email}</span>
      </p>
    ),
  },
  {
    key: "pm",
    label: "Project Manager",
    width: "w-[15%]",
    renderCell: (user) => (
      <div className="text-sm">
        {user.manager?.name || <div className="ms-2">-</div>}
      </div>
    ),
  },
  {
    key: "teamMembersCount",
    label: "Team Members",
    width: "w-[10%]",
    renderCell: (user) => (
      <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        <Users className="h-3.5 w-3.5" />
        {user.subordinates?.length || 0}
      </div>
    ),
  },
  {
    key: "projectsCount",
    label: "Projects",
    width: "w-[10%]",
    renderCell: (user) => (
      <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
        <FolderKanban className="h-3.5 w-3.5" />
        {user.leadProjects?.length || 0}
      </div>
    ),
  },
  {
    key: "Designation",
    label: "Designation",
    width: "w-[12%]",
    renderCell: (user) => (
      <div className="inline-flex items-center rounded-full px-3 py-1 text-sm">
        {user.designation || "Team Lead"}
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
  password?: string | null;
  designation?: string | null;
  department?: string | null;
  phone?: string | null;
  skills?: unknown;
  isActive: boolean;
  manager?: {
    id: number;
    name?: string;
    email?: string;
  } | null;
  leadProjects?: Array<{
    id: number;
    name?: string;
  }>;
  subordinates?: Array<{
    id: number;
    name?: string;
    email?: string;
  }>;
}

interface TeamLeadListProps {
  initialData: User[];
}

function TeamLeadList({ initialData }: TeamLeadListProps) {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const [users, setUsers] = useState<User[]>(initialData);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const search = searchParams.get("search") || undefined;
      const params = new URLSearchParams();
      params.append("role", "TL");
      if (search) params.append("search", search);
      const queryString = params.toString();
      const url = queryString ? `/users?${queryString}` : "/users?role=TL";
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

  const handleUpdateUser = async (user: {
    id: number;
    name: string;
    email: string;
    role: "TL";
    password?: string;
    designation?: string;
    department?: string;
    phone?: string;
    skills?: string[];
    managerId?: number | null;
    assignedProjectId?: number | null;
  }) => {
    try {
      const { password, id, ...userData } = user;
      const res = await api.patch(`/users/${user.id}`, userData);
      if (res.status !== 200) throw new Error("Failed to update user");
      toast.success("Team lead updated successfully");
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update team lead");
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const res = await api.delete(`/users/${user.id}`);
      if (res.status !== 200) throw new Error("Failed to delete user");
      setUsers(users.filter((u) => u.id !== user.id));
      toast.success("Team lead deleted successfully");
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete team lead");
    }
  };

  const handleCreateUser = async (user: {
    name: string;
    email: string;
    role: "TL";
    password: string;
    designation?: string;
    department?: string;
    phone?: string;
    skills?: string[];
    managerId?: number | null;
    assignedProjectId?: number | null;
  }) => {
    try {
      const res = await api.post("/users", { ...user, role: "TL" });
      if (res.status !== 201) throw new Error("Failed to create user");
      toast.success("Team lead created successfully");
      await fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create team lead");
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
            <TeamLeadFilter onAddUser={handleAddUser} />
          </CardHeader>
          <CardContent className="">
            <Table<User>
              columns={columns}
              data={users}
              onEdit={handleEditClick}
              onDelete={handleDeleteUser}
              deleteDialog={{
                title: "Are you sure you want to delete this Team Lead?",
                description: (row) =>
                  `"${row.name}" will be removed permanently.`,
              }}
            />
          </CardContent>
        </Card>
      </div>
      <TLDialog
        user={editingUser}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleCreateUser}
        onUpdate={handleUpdateUser}
      />
    </section>
  );
}

export default TeamLeadList;
