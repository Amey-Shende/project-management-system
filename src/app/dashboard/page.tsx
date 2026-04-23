import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CircleCheckBig, Clock3, ListChecks, LucideIcon, TriangleAlert } from "lucide-react";

type CountCard = {
    title: string;
    count: number;
    icon: LucideIcon;
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

    const countCard: CountCard[] = [
        {
            title: "Total Project",
            count: 6,
            icon: ListChecks,
            note: `${10}% completion rate`,
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
            title: "Active Project",
            count: 3,
            icon: Clock3,
            note: `${30}% of board in progress`,
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
            title: "Completed Project",
            count: 3,
            icon: CircleCheckBig,
            note: `${30} due today already closed`,
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
            title: "Overdue Project",
            count: 0,
            icon: TriangleAlert,
            note: `${0}% of board is overdue`,
            tone: {
                icon: "text-rose-700",
                ring: "ring-rose-200",
                glow: "from-rose-100/85 via-rose-50/30 to-transparent",
                bar: "bg-rose-600",
                badge: "bg-rose-50 text-rose-700 border-rose-200",
                soft: "bg-rose-50/80",
            },
        },
    ];

    return (
        <section className="w-full p-2">
            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
                {countCard?.map((card) => {
                    const Icon = card.icon;
                    const percentage = 50;

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
                                        {/* <p className="mt-1 text-xs text-neutral-500">{card.note}</p> */}
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
                                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${card.tone.badge}`}>
                                        {Math.round(percentage)}%
                                    </span>
                                </div>

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
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section >
    );
}


// <section className="w-full p-2">
//     <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${userRole === "ADMIN" ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
//         {countCard.map((card) => {
//             const Icon = card.icon;
//             const percentage = Math.min((card.count / baseCount) * 100, 100);

//             return (
//                 <Card
//                     key={card.title}
//                     className="group relative overflow-hidden border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md h-45"
//                 >
//                     <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${card.tone.glow}`} />
//                     <CardHeader className="relative ">
//                         <div className="flex items-start justify-between gap-3">
//                             <div>
//                                 <p className="text-md font-semibold text-neutral-900">{card.title}</p>
//                                 {/* <p className="mt-1 text-xs text-neutral-500">{card.note}</p> */}
//                             </div>
//                             <div className={`grid h-8 w-8 place-items-center rounded-2xl bg-white/90 ring-1 ${card.tone.ring} shadow-sm transition-transform duration-300 group-hover:scale-105`}>
//                                 <Icon className={`h-5 w-5 ${card.tone.icon}`} />
//                             </div>
//                         </div>
//                     </CardHeader>

//                     <CardContent className="relative pt-0 pb-2">
//                         <div className="flex items-end justify-between gap-2">
//                             <div>
//                                 <p className="text-3xl font-bold leading-none text-neutral-950">{card.count}</p>
//                             </div>

//                             {card.title !== "Total Users" && (
//                                 <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${card.tone.badge}`}>
//                                     {Math.round(percentage)}%
//                                 </span>
//                             )}
//                         </div>

//                         {card.title !== "Total Users" && (
//                             <div className="mt-3">
//                                 <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wide text-neutral-500">
//                                     <span>Progress</span>
//                                     <span>{Math.round(percentage)}%</span>
//                                 </div>
//                                 <div className="h-2 w-full rounded-full bg-white/70">
//                                     <div
//                                         className={`h-2.5 rounded-full ${card.tone.bar} transition-all duration-500`}
//                                         style={{ width: `${percentage}%` }}
//                                     />
//                                 </div>
//                             </div>
//                         )}
//                     </CardContent>
//                 </Card>
//             );
//         })}
//     </div>

//     <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr] ">
//         <Card className="overflow-hidden border shadow-sm">
//             <CardContent className="relative p-0">
//                 <div className="relative grid gap-0 w-full ">
//                     <div className="ps-4 pt-1">
//                         <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Today&apos;s Deadline queue</p>
//                         <div className="mt-4 space-y-3 overflow-y-auto max-h-90 pr-3 scrollbar-thin">
//                             {todayTodos.length > 0 ? (
//                                 todayTodos?.map((todo) => {
//                                     const priorityTone =
//                                         todo.priority === "High"
//                                             ? "border-rose-200 bg-rose-50 text-rose-700"
//                                             : todo.priority === "Medium"
//                                                 ? "border-amber-200 bg-amber-50 text-amber-700"
//                                                 : "border-emerald-200 bg-emerald-50 text-emerald-700";


//                                     return (
//                                         <div key={todo.id} className="rounded-2xl border bg-white/85 p-4 shadow-sm">
//                                             <div className="flex items-start justify-between gap-3">
//                                                 <div className="min-w-0">
//                                                     <Tooltip>
//                                                         <TooltipTrigger asChild>
//                                                             <p className="text-sm font-semibold text-neutral-900 truncate max-w-100">
//                                                                 {todo.title}
//                                                             </p>
//                                                         </TooltipTrigger>
//                                                         {todo.title.length > 25 && (
//                                                             <TooltipContent className="max-w-80 wrap-break-word">
//                                                                 {todo.title}
//                                                             </TooltipContent>
//                                                         )}
//                                                     </Tooltip>
//                                                     <p className="mt-1 text-xs text-neutral-500 truncate max-w-100">{descriptionModify(todo.description)
//                                                         || <i> No description added</i>}
//                                                     </p>
//                                                 </div>
//                                                 <div className="flex items-start justify-between gap-3">
//                                                     <Badge variant="secondary" className="rounded-full border px-2.5 py-1 text-xs font-semibold">
//                                                         <Tag className="h-3.5 w-3.5" />
//                                                         {todo.category}
//                                                     </Badge>
//                                                     <Badge className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityTone}`}>
//                                                         {todo.priority}
//                                                     </Badge>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })
//                             ) : (
//                                 <div className="rounded-2xl h-90  border border-dashed bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
//                                     No tasks are lined up for today.
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </CardContent>
//         </Card>

//         <Card className="border shadow-sm">
//             <CardHeader>
//                 <CardTitle className="flex items-center gap-2 text-lg text-neutral-900">
//                     <ArrowUpRight className="h-5 w-5 text-sky-600" />
//                     Quick Focus
//                 </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//                 <div className="rounded-2xl border bg-neutral-50 px-4 py-3">
//                     <p className="text-sm font-medium text-neutral-900">Priority direction</p>
//                     <p className="mt-2 text-sm leading-6 text-neutral-600">
//                         {overdue > 0
//                             ? "Start with overdue work, then clear today's deadlines."
//                             : dueTodayCount > 0
//                                 ? "Finish today's deadlines early to keep the board clear."
//                                 : "No urgent deadlines today. This is a good time to close active tasks."}
//                     </p>
//                 </div>

//                 <div className="rounded-2xl border bg-neutral-50 px-4 py-4">
//                     <div className="flex items-center justify-between gap-3">
//                         <div>
//                             <p className="text-sm font-medium text-neutral-900">Board momentum</p>
//                             <p className="mt-1 text-xs text-neutral-500">{completed} of {total} tasks completed</p>
//                         </div>
//                         <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-neutral-700 shadow-sm">
//                             {completionRate}%
//                         </span>
//                     </div>
//                     <div className="mt-4 h-2.5 w-full rounded-full bg-neutral-100">
//                         <div
//                             className="h-2.5 rounded-full bg-linear-to-r from-sky-500 via-emerald-500 to-lime-400"
//                             style={{ width: `${completionRate}%` }}
//                         />
//                     </div>
//                 </div>

//                 <div className="rounded-2xl border bg-neutral-50 px-4 py-4">
//                     <p className="text-sm font-medium text-neutral-900">Watch list</p>
//                     <div className="mt-2 space-y-1 text-sm leading-6 text-neutral-600">
//                         {highPriorityToday > 0 && (
//                             <div className="flex items-center justify-between">
//                                 <span>🔴 High priority deadline{highPriorityToday === 1 ? "" : "s"}</span>
//                                 <span className="font-semibold text-rose-700">{highPriorityToday}</span>
//                             </div>
//                         )}
//                         {mediumPriorityToday > 0 && (
//                             <div className="flex items-center justify-between">
//                                 <span>🟡 Medium priority deadline{mediumPriorityToday === 1 ? "" : "s"}</span>
//                                 <span className="font-semibold text-amber-700">{mediumPriorityToday}</span>
//                             </div>
//                         )}
//                         {lowPriorityToday > 0 && (
//                             <div className="flex items-center justify-between">
//                                 <span>🟢 Low priority deadline{lowPriorityToday === 1 ? "" : "s"}</span>
//                                 <span className="font-semibold text-emerald-700">{lowPriorityToday}</span>
//                             </div>
//                         )}
//                         {highPriorityToday === 0 && mediumPriorityToday === 0 && lowPriorityToday === 0 && (
//                             <p className="text-neutral-500 italic">No priority tasks pending today.</p>
//                         )}
//                     </div>
//                 </div>
//             </CardContent>
//         </Card>
//     </div>
// </section >