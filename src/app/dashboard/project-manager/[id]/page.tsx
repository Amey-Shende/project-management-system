import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getProjectManagerDetailService } from "@/services/user.service";
import { generateColor } from "@/lib/utils";
import { Users, Briefcase, Mail, Phone, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProjectManagerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProjectManagerDetailService(Number(id));

  const { projects, activeProjects, completedProjects, ...user } = data;

  const totalTeamLeads = user.subordinates?.length || 0;
  const totalTeamMembers = user.subordinates?.reduce(
    (acc: number, tl: any) => acc + (tl.subordinates?.length || 0),
    0,
  );

  return (
    <section className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/project-manager">
          <Button variant="ghost" className="mb-4 gap-2 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Back to Project Managers
          </Button>
        </Link>
      </div>

      {/* Profile Card */}
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div
              className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: generateColor(user.name, user.id) }}
            >
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">Project Manager</p>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {user.phone}
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {user.department}
                  </div>
                )}
              </div>
            </div>
            {user.manager && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Reports To</p>
                <p className="font-semibold">{user.manager.name}</p>
                <p className="text-sm text-muted-foreground">
                  {user.manager.email}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-sm text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeProjects}</p>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedProjects}</p>
                <p className="text-sm text-muted-foreground">
                  Completed Projects
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTeamLeads}</p>
                <p className="text-sm text-muted-foreground">Team Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Projects Section */}
      <Card className="border shadow-sm">
        <CardHeader>
          <h2 className="text-lg font-semibold">Projects</h2>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <div className="space-y-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="block"
                >
                  <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                          style={{
                            backgroundColor: generateColor(
                              project.name,
                              project.id,
                            ),
                          }}
                        >
                          {project.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <p className="font-medium text-sm truncate">
                          {project.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {project._count.members} members
                        </span>
                        {project.teamLead && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {project.teamLead.name}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            project.status === "ACTIVE"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No projects assigned
            </p>
          )}
        </CardContent>
      </Card>

      {/* Team Section */}
      <Card className="border shadow-sm">
        <CardHeader>
          <h2 className="text-lg font-semibold">Team Structure</h2>
        </CardHeader>
        <CardContent>
          {user.subordinates && user.subordinates.length > 0 ? (
            <div className="space-y-4">
              {user.subordinates.map((tl) => (
                <div key={tl.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold"
                      style={{ backgroundColor: generateColor(tl.name, tl.id) }}
                    >
                      {tl.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{tl.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {tl.email}
                      </p>
                    </div>
                    <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      Team Lead
                    </span>
                  </div>
                  {tl.subordinates && tl.subordinates.length > 0 && (
                    <div className="ml-8 space-y-2">
                      {tl.subordinates.map((tm) => (
                        <div
                          key={tm.id}
                          className="flex items-center gap-2 text-sm border-l border-gray-200 pl-3"
                        >
                          <div
                            className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-semibold"
                            style={{
                              backgroundColor: generateColor(tm.name, tm.id),
                            }}
                          >
                            {tm.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span>{tm.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {tm.email}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No team members assigned
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
