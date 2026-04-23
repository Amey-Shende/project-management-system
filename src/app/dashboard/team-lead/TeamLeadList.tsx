"use client";
import Table, { TableColumn } from "@/components/Table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { TeamLeadFilter } from "./TeamLeadFilter";
import { TLDialog } from "./TLDialog";
import { Mail, UserRound, Briefcase, Users } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { generateColor } from "@/lib/utils";

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
          <p className="truncate text-sm font-semibold">{user.name}</p>
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
    key: "projects_managed",
    label: "Projects Managed",
    width: "w-[15%]",
    renderCell: () => (
      <div className="inline-flex items-center justify-center align-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
        8
      </div>
    ),
  },
  {
    key: "team_size",
    label: "Team Size",
    width: "w-[10%]",
    renderCell: () => (
      <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        <Users className="h-3.5 w-3.5" />
        12
      </div>
    ),
  },
  // {
  //   key: "experience",
  //   label: "Experience",
  //   width: "w-[10%]",
  //   renderCell: () => <div className="text-sm font-medium">5 years</div>,
  // },
  {
    key: "report_to",
    label: "Report To",
    width: "w-[10%]",
    renderCell: () => <div className="text-sm font-medium">John Doe</div>,
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

interface TeamLeadListProps {
  initialData: User[];
}

function TeamLeadList({ initialData }: TeamLeadListProps) {
  const [users, setUsers] = useState<User[]>(initialData);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
  }) => {
    try {
      const { password, id, ...userData } = user;
      const res = await api.patch(`/users/${user.id}`, userData);
      if (res.status !== 200) throw new Error("Failed to update user");
      const data = res.data.data;
      setUsers(users.map((u) => (u.id === user.id ? data : u)));
      toast.success("Team lead updated successfully");
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
  }) => {
    try {
      const res = await api.post("/users", { ...user, role: "TL" });
      if (res.status !== 201) throw new Error("Failed to create user");
      const data = res.data.data;
      setUsers([...users, data]);
      toast.success("Team lead created successfully");
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
        <Card className="p-4 h-[calc(100vh-6rem)] bg-white">
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
