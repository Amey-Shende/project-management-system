"use client"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { handleLogout } from "@/lib/utils";
import { LayoutDashboard, ListChecks, LogOutIcon, Users, User, LucideIcon, ShieldCheck, BriefcaseBusiness, Briefcase, LogOut } from "lucide-react"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Dynamischlogo from "../../public/mobile_nav_logo.svg";
import Image from "next/image";

// // Define menu items array
// const menuItems: Array<{
//     href: string;
//     label: string;
//     icon: LucideIcon;
//     requiresAdmin?: boolean;
// }> = [
//         {
//             href: "/dashboard",
//             label: "Dashboard",
//             icon: LayoutDashboard,
//             requiresAdmin: false,
//         },
//         {
//             href: "/dashboard/project-manager",
//             label: "Project Manager",
//             icon: BriefcaseBusiness,
//             requiresAdmin: false,
//         },
//         {
//             href: "/dashboard/team-lead",
//             label: "Team Lead",
//             icon: ShieldCheck,
//             requiresAdmin: false,
//         },
//         {
//             href: "/dashboard/team-member",
//             label: "Team Member",
//             icon: User,
//             requiresAdmin: false,
//         },
//     ];

// export function AppSidebar({ user }: { user: { role: string } | null }) {
//     const router = useRouter();
//     const pathname = usePathname()

//     // Filter menu items based on user role
//     const visibleMenuItems = menuItems.filter(item => {
//         if (item.requiresAdmin) {
//             return user?.role === "ADMIN";
//         }
//         return true;
//     });

//     return (
//         <Sidebar>
//             <SidebarHeader>
//                 <div className="rounded-md  px-2">
//                     <h1 className="text-sm text-gray-500">Project Management</h1>
//                     {/* Use flex and items-center to align logo and text horizontally */}
//                     <div className="flex items-center gap-2 mt-1">
//                         <Image
//                             alt="Dynamisch logo"
//                             src={Dynamischlogo}
//                             width={20}
//                             height={20}
//                             className="object-contain"
//                         />
//                         <span className="font-semibold text-[16px] text-[#29447A]">Dynamisch</span>
//                     </div>
//                 </div>


//             </SidebarHeader>
//             <SidebarSeparator className="w-[97%]!" />
//             <SidebarContent className="ps-1">
//                 <SidebarGroup>
//                     <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
//                     <SidebarGroupContent>
//                         <SidebarMenu>
//                             {visibleMenuItems.map((item) => {
//                                 const Icon = item.icon;
//                                 return (
//                                     <SidebarMenuItem key={item.href}>
//                                         <SidebarMenuButton
//                                             asChild
//                                             isActive={pathname === item.href}
//                                         >
//                                             <Link href={item.href}>
//                                                 <Icon />
//                                                 <span>{item.label}</span>
//                                             </Link>
//                                         </SidebarMenuButton>
//                                     </SidebarMenuItem>
//                                 );
//                             })}
//                         </SidebarMenu>
//                     </SidebarGroupContent>
//                 </SidebarGroup>

//             </SidebarContent>
//             <SidebarSeparator className="w-[97%]!" />
//             <SidebarFooter>
//                 <SidebarMenuItem>
//                     <SidebarMenuButton onClick={() => handleLogout(router)}>
//                         <LogOutIcon />
//                         <span>Logout</span>
//                     </SidebarMenuButton>
//                 </SidebarMenuItem>
//             </SidebarFooter>
//         </Sidebar>
//     )
// }

// Define menu items array
const menuItems: Array<{
    href: string;
    label: string;
    icon: LucideIcon;
    requiresAdmin?: boolean;
}> = [
        {
            href: "/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            href: "/dashboard/project-manager",
            label: "Project Manager",
            icon: BriefcaseBusiness,
        },
        {
            href: "/dashboard/team-lead",
            label: "Team Lead",
            icon: ShieldCheck,
        },
        {
            href: "/dashboard/team-member",
            label: "Team Member",
            icon: Users, // 🔥 better than User
        },
    ];

export function AppSidebar({ user }: { user: { role: string } | null }) {
    const router = useRouter();
    const pathname = usePathname();

    const visibleMenuItems = menuItems.filter(item => {
        if (item.requiresAdmin) {
            return user?.role === "ADMIN";
        }
        return true;
    });

    return (
        <Sidebar className="bg-white border-r">
            {/* Header */}
            <SidebarHeader className="border-b  border-gray-300">
                <div className="px-3 pt-2.5 pb-1">
                    <h1 className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                        Project Management
                    </h1>

                    <div className="flex items-center gap-2 mt-2">
                        <Image
                            alt="Dynamisch logo"
                            src={Dynamischlogo}
                            width={22}
                            height={22}
                            className="object-contain"
                        />
                        <span className="font-semibold text-[16px] text-[#29447A]">
                            Dynamisch
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2">
                <SidebarGroup className="pt-0">
                    <SidebarGroupLabel className="text-xs text-gray-400 uppercase tracking-wide px-2 mb-1">
                        Main Navigation
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {visibleMenuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className={`
                                                flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all
                                                ${isActive
                                                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                                                    : "text-gray-600 hover:bg-gray-100"
                                                }
                                            `}
                                        >
                                            <Link href={item.href}>
                                                <Icon size={18} />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="border-t border-gray-300 p-2 pb-2">
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={() => handleLogout(router)}
                        className="flex items-center gap-3 px-3 py-2 text-sm  font-medium transition-all
                         text-gray-600 hover:bg-gray-100 cursor-pointer"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarFooter>
        </Sidebar>
    );
}