import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamAvatars } from "@/components/TeamAvatars";
import { generateColor } from "@/lib/utils";
import { removeDuplicatesByKey } from "@/lib/arrayUtils";
import { getUserByIdService } from "@/services/user.service";
import { userRole } from "@/lib/constant";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Code2,
  FolderKanban,
  Mail,
  Phone,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";

export default async function TeamLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserByIdService(Number(id));

  if (!user) {
    notFound();
  }
  return (
    <div className="p-3">
      <Link href="/dashboard/team-lead">
        <Button variant="ghost" className="mb-4 gap-2 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          Back to Team Leads
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
              {/* <div className="flex items-center gap-2">
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
              </div> */}
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
                  Key Expertise
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

        {/* Projects Managed */}
        {user.memberProjects && user.memberProjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FolderKanban className="h-5 w-5" />
                Projects Managed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 -mt-5">
              {user.memberProjects?.map((memberProject: any) => (
                <div
                  key={memberProject.project.id}
                  className="flex items-center gap-3"
                >
                  <>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                      {memberProject.project.name
                        .split(" ")
                        .map((p: string) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-base">
                        {memberProject.project.name}
                      </p>
                      <Link
                        href={`/dashboard/projects/${memberProject.project.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        View Project Details
                      </Link>
                    </div>
                  </>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Team Members */}
        {user.subordinates && user.subordinates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Team Members ({user.subordinates.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-5">
              <div className="grid gap-3">
                {user.subordinates.map((subordinate: any) => (
                  <div
                    key={subordinate.id}
                    className="flex items-center gap-3  rounded-lgr"
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: generateColor(
                          subordinate.name,
                          subordinate.id,
                        ),
                      }}
                    >
                      {subordinate.name
                        .split(" ")
                        .map((p: string) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{subordinate.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {subordinate.email}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/team-member/${subordinate.id}`}
                      className="ml-auto text-sm text-blue-600 hover:text-blue-700"
                    >
                      View Profile
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manager Information */}
        {(() => {
          const onlyManager = user?.manager as
            | { id: number; name: string }
            | undefined;
          const projectManagers = user?.memberProjects
            ?.map(
              (val: {
                manager: {
                  id: number;
                  name: string;
                  email: string;
                  role: any;
                } | null;
              }) => val.manager,
            )
            .filter(
              (
                manager,
              ): manager is {
                id: number;
                name: string;
                email: string;
                role: any;
              } => manager !== null,
            );
          const managers =
            projectManagers && projectManagers.length > 0
              ? projectManagers
              : onlyManager
                ? [onlyManager]
                : [];

          const uniqueUsers =  removeDuplicatesByKey(managers, "id");

          return uniqueUsers.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Reports To
                </CardTitle>
              </CardHeader>
              <CardContent className="-mt-5 space-y-3">
                {uniqueUsers.map((manager: any) => (
                  <div key={manager.id} className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold "
                      style={{
                        backgroundColor: generateColor(
                          manager.name,
                          manager.id,
                        ),
                      }}
                    >
                      {manager.name
                        .split(" ")
                        .map((p: string) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{manager.name}</p>
                      <p className="text-sm text-muted-foreground -mt-1">
                        <Link
                          href={`/dashboard/project-manager/${manager.id}`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View Profile
                        </Link>
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null;
        })()}
      </div>
    </div>
  );
}
