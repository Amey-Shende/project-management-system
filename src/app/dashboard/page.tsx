import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheckBig, Clock3, ListChecks, Users, Briefcase, FolderKanban } from "lucide-react";
import { getDashboardStatsService, getOrganizationHierarchyService } from "@/services/dashboard.service";
import Link from "next/link";

type CountCard = {
    title: string;
    count: number;
    icon: any;
    note: string;
    tone: {
        icon: string;
        ring: string;
        glow: string;
        bar: string;
        badge: string;
        soft: string;
    };
};

export default async function DashboardPage() {
    const stats = await getDashboardStatsService();
    const hierarchy = await getOrganizationHierarchyService();

    const completionRate = stats.totalProjects > 0 
        ? Math.round((stats.completedProjects / stats.totalProjects) * 100) 
        : 0;

    const countCard: CountCard[] = [
        {
            title: "Total Projects",
            count: stats.totalProjects,
            icon: ListChecks,
            note: `${completionRate}% completion rate`,
            tone: {
                icon: "text-sky-700",
                ring: "ring-sky-200",
                glow: "from-sky-100/85 via-sky-50/30 to-transparent",
                bar: "bg-sky-600",
                badge: "bg-sky-50 text-sky-700 border-sky-200",
                soft: "bg-sky-50/80",
            },
        },
        {
            title: "Active Projects",
            count: stats.activeProjects,
            icon: Clock3,
            note: `${Math.round((stats.activeProjects / stats.totalProjects) * 100) || 0}% in progress`,
            tone: {
                icon: "text-amber-700",
                ring: "ring-amber-200",
                glow: "from-amber-100/85 via-amber-50/30 to-transparent",
                bar: "bg-amber-500",
                badge: "bg-amber-50 text-amber-700 border-amber-200",
                soft: "bg-amber-50/80",
            },
        },
        {
            title: "Completed Projects",
            count: stats.completedProjects,
            icon: CircleCheckBig,
            note: `${stats.completedProjects} projects closed`,
            tone: {
                icon: "text-emerald-700",
                ring: "ring-emerald-200",
                glow: "from-emerald-100/85 via-emerald-50/30 to-transparent",
                bar: "bg-emerald-600",
                badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
                soft: "bg-emerald-50/80",
            },
        },
        {
            title: "Total Team",
            count: stats.totalPM + stats.totalTL + stats.totalTM,
            icon: Users,
            note: `${stats.totalPM} PM, ${stats.totalTL} TL, ${stats.totalTM} TM`,
            tone: {
                icon: "text-purple-700",
                ring: "ring-purple-200",
                glow: "from-purple-100/85 via-purple-50/30 to-transparent",
                bar: "bg-purple-600",
                badge: "bg-purple-50 text-purple-700 border-purple-200",
                soft: "bg-purple-50/80",
            },
        },
    ];

    return (
        <section className="w-full p-2 space-y-6">
            {/* KPI Cards */}
            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
                {countCard?.map((card) => {
                    const Icon = card.icon;
                    const percentage = card.title === "Total Projects" 
                        ? completionRate 
                        : card.title === "Active Projects"
                        ? Math.round((card.count / stats.totalProjects) * 100) || 0
                        : card.title === "Completed Projects"
                        ? completionRate
                        : 50;

                    return (
                        <Card
                            key={card.title}
                            className="group relative overflow-hidden border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md h-45"
                        >
                            <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${card.tone.glow}`} />
                            <CardHeader className="relative ">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-md font-semibold text-neutral-900">{card.title}</p>
                                    </div>
                                    <div className={`grid h-8 w-8 place-items-center rounded-2xl bg-white/90 ring-1 ${card.tone.ring} shadow-sm transition-transform duration-300 group-hover:scale-105`}>
                                        <Icon className={`h-5 w-5 ${card.tone.icon}`} />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="relative pt-0 pb-2">
                                <div className="flex items-end justify-between gap-2">
                                    <div>
                                        <p className="text-3xl font-bold leading-none text-neutral-950">{card.count}</p>
                                    </div>
                                    {card.title !== "Total Team" && (
                                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${card.tone.badge}`}>
                                            {Math.round(percentage)}%
                                        </span>
                                    )}
                                </div>

                                {card.title !== "Total Team" && (
                                    <div className="mt-3">
                                        <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wide text-neutral-500">
                                            <span>Progress</span>
                                            <span>{Math.round(percentage)}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-white/70">
                                            <div
                                                className={`h-2.5 rounded-full ${card.tone.bar} transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 xl:grid-cols-2">
                {/* Project Status Distribution */}
                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FolderKanban className="h-5 w-5 text-sky-600" />
                            Project Status Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.projectStatusDistribution.map((item) => (
                                <div key={item.status} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-3 w-3 rounded-full ${
                                            item.status === "ACTIVE" ? "bg-amber-500" : "bg-emerald-500"
                                        }`} />
                                        <span className="text-sm font-medium">{item.status}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${
                                                    item.status === "ACTIVE" ? "bg-amber-500" : "bg-emerald-500"
                                                }`}
                                                style={{
                                                    width: `${(item.count / stats.totalProjects) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold w-12 text-right">{item.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Project Growth */}
                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Briefcase className="h-5 w-5 text-purple-600" />
                            Project Growth Over Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.projectGrowth.length > 0 ? (
                            <div className="space-y-3">
                                {stats.projectGrowth.slice(-6).map((item) => (
                                    <div key={item.month} className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground w-24">
                                            {new Date(item.month + "-01").toLocaleDateString("en-US", {
                                                month: "short",
                                                year: "2-digit",
                                            })}
                                        </span>
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-sky-500"
                                                    style={{
                                                        width: `${((item.active + item.completed) / Math.max(...stats.projectGrowth.map(p => p.active + p.completed))) * 100}%`
                                                    }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-amber-600">{item.active} Active</span>
                                                <span className="text-emerald-600">{item.completed} Done</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No project data available</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Organization Hierarchy */}
            {/* <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="h-5 w-5 text-emerald-600" />
                        Organization Hierarchy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {hierarchy.length > 0 ? (
                        <div className="space-y-4">
                            {hierarchy.map((pm) => (
                                <div key={pm.id} className="border rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                                            {pm.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{pm.name}</p>
                                            <p className="text-sm text-muted-foreground">{pm.email}</p>
                                        </div>
                                        <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">PM</span>
                                    </div>
                                    {pm.subordinates && pm.subordinates.length > 0 && (
                                        <div className="ml-8 space-y-2">
                                            {pm.subordinates.map((tl) => (
                                                <div key={tl.id} className="border-l-2 border-gray-200 pl-4">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm">
                                                            {tl.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{tl.name}</p>
                                                            <p className="text-xs text-muted-foreground">{tl.email}</p>
                                                        </div>
                                                        <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">TL</span>
                                                    </div>
                                                    {tl.subordinates && tl.subordinates.length > 0 && (
                                                        <div className="ml-8 space-y-1">
                                                            {tl.subordinates.map((tm) => (
                                                                <div key={tm.id} className="flex items-center gap-2 text-sm border-l border-gray-100 pl-3">
                                                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-xs">
                                                                        {tm.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                                                    </div>
                                                                    <span>{tm.name}</span>
                                                                    <span className="text-xs text-muted-foreground">{tm.email}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No organization data available</p>
                    )}
                </CardContent>
            </Card> */}
        </section >
    );
}