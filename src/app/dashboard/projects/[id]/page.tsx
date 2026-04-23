import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, User, Calendar, Briefcase } from "lucide-react";
import Link from "next/link";
import { getProjectByIdService } from "@/services/project.service";
import { generateColor } from "@/lib/utils";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectByIdService(Number(id));

  if (!project) {
    notFound();
  }

  return (
    <div className="p-3">
      <Link href="/dashboard/projects">
        <Button variant="ghost" className="mb-4 gap-2 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
      </Link>

      <div className="grid gap-6">
        {/* Project Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl mb-2 break-words">
                  {project.name}
                </CardTitle>
              </div>
              <span
                className={`flex-shrink-0 ${
                  project.status === "ACTIVE"
                    ? "inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                    : "inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                }`}
              >
                {project.status === "ACTIVE" ? "Active" : "Completed"}
              </span>
            </div>
            {project.description && (
              <p className="text-muted-foreground break-words max-w-full">
                {project.description}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Created:{" "}
                  {new Date(project.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{project._count?.members || 0} Team Members</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Project Manager */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5" />
                Project Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.projectManager ? (
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: generateColor(
                        project.projectManager.name,
                        project.projectManager.id,
                      ),
                    }}
                  >
                    {project.projectManager.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {project.projectManager.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {project.projectManager.email}
                    </p>
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium mt-1">
                      {project.projectManager.role}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No project manager assigned
                </p>
              )}
            </CardContent>
          </Card>

          {/* Team Lead */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Team Lead
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.teamLead ? (
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: generateColor(
                        project.teamLead.name,
                        project.teamLead.id,
                      ),
                    }}
                  >
                    {project.teamLead.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{project.teamLead.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.teamLead.email}
                    </p>
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium mt-1">
                      {project.teamLead.role}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No team lead assigned</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Team Members ({project._count?.members || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.members && project.members.length > 0 ? (
              <div className="grid gap-3">
                {project.members.map((member: any) => (
                  <div
                    key={member.user.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                        style={{
                          backgroundColor: generateColor(
                            member.user.name,
                            member.user.id,
                          ),
                        }}
                      >
                        {member.user.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{member.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
                        {member.user.role}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Assigned:{" "}
                        {new Date(member.assignedAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No team members assigned yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
