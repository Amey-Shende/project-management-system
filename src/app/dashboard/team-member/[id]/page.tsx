import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Calendar,
  Code2,
  CheckCircle,
  XCircle,
  FolderKanban,
} from "lucide-react";
import Link from "next/link";
import { getUserByIdService } from "@/services/user.service";
import { generateColor } from "@/lib/utils";
import { userRole } from "@/lib/constant";

export default async function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserByIdService(Number(id));

  if (!user) {
    notFound();
  }

  const assignedProject = user.memberProjects?.[0]?.project;

  return (
    <div className="p-3">
      <Link href="/dashboard/team-member">
        <Button variant="ghost" className="mb-4 gap-2 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          Back to Team Members
        </Button>
      </Link>

      <div className="grid gap-6">
        {/* User Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold"
                  style={{ backgroundColor: generateColor(user.name, user.id) }}
                >
                  {user.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-2xl mb-1">{user.name}</CardTitle>
                  <p className="text-muted-foreground">{user.email}</p>
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium mt-2">
                    {userRole[user.role]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.isActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    <XCircle className="h-3 w-3" />
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="-mt-5">
            <div className="flex justify-end gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined:{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 -mt-5">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {user.email || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {user.phone || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5" />
                Work Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 -mt-5">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Designation</p>
                  <p className="text-sm text-muted-foreground">
                    {user.designation || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-sm text-muted-foreground">
                    {user.department || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills */}
        {user.skills &&
          Array.isArray(user.skills) &&
          user.skills.length > 0 && (
            <Card>
              <CardHeader className="mt-0 pt-0 pb-0 mb-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code2 className="h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="-mt-5">
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill: any, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                    >
                      {/* <Code2 className="h-3 w-3" /> */}
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Assigned Project */}
        {assignedProject && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FolderKanban className="h-5 w-5" />
                Assigned Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 -mt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                  {assignedProject.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{assignedProject.name}</p>
                  <Link
                    href={`/dashboard/projects/${assignedProject.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View Project Details
                  </Link>
                </div>
              </div>
              {assignedProject.projectManager && (
                <div className="flex items-center gap-3 pt-4 border-t">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: generateColor(
                        assignedProject.projectManager.name,
                        assignedProject.projectManager.id,
                      ),
                    }}
                  >
                    {assignedProject.projectManager.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">Project Manager</p>
                    <p className="text-sm text-muted-foreground">
                      {assignedProject.projectManager.name}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manager Information */}
        {user.manager && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Reports To
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full  text-sm font-semibold "
                  style={{
                    backgroundColor: generateColor(
                      user.manager.name,
                      user.manager.id,
                    ),
                  }}
                >
                  {user.manager.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{user.manager.name}</p>
                  <p className="-mt-1">
                    <Link
                      href={`/dashboard/team-lead/${user.manager.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 "
                    >
                      View Profile
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
