"use client";
import React, { useEffect, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { SidebarTrigger } from "./ui/sidebar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CircleUserRound, Search } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
// import { NotificationBell } from "./Notificationbell";
// import axios from "axios";
// import api from "@/lib/axios";
// import { debouncing } from "@/lib/utils";

const NavbarUsername = dynamic(() => import("./NavbarUsername"), { ssr: false });

function Navbar({ user }: { user: { id: string; name: string; email: string; role: string } | null }) {
    const pathname = usePathname(); // e.g. "/dashboard/todo"
    const searchParams = useSearchParams();
    const router = useRouter();
    const [q, setQ] = useState("");
    const [, startTransition] = useTransition();

    const pageTitleMap: Record<string, string> = {
        "/dashboard": "Dashboard",
        "/dashboard/todo": "Task List",
        "/dashboard/users": "Users List",
        "/dashboard/profile": "My Profile",
    };

    const title = pageTitleMap[pathname] ?? "App";
    const isTodoPage = pathname === "/dashboard/todo";

    // Keep input in sync with URL (important on back/forward and server navigations)
    useEffect(() => {
        if (!isTodoPage) return;
        startTransition(() => {
            setQ(searchParams.get("q") ?? "");
        });
    }, [isTodoPage, searchParams]);

    useEffect(() => {
        if (!isTodoPage) return;

        const t = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            const nextQ = q.trim();
            const currentQ = searchParams.get("q") ?? "";

            if (nextQ) params.set("q", nextQ);
            else params.delete("q");

            // Prevent redundant replace
            if (nextQ === currentQ) return;

            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname);
        }, 300);

        return () => clearTimeout(t);
    }, [q, isTodoPage, pathname, router, searchParams]);


    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQ(e.target.value);
    }

    return (
        <nav className="h-15 w-full flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">{title}</h1>
            </div>

            <div className="flex items-center">
                {isTodoPage && (
                    <div className="mr-10 flex items-center gap-2 relative">
                        <Search className="size-4.5 absolute left-2 top-1/2 transform -translate-y-1/2" />
                        <Input
                            value={q}
                            onChange={handleSearch}
                            placeholder="Search tasks..."
                            className="md:w-100 bg-white pl-8"
                        />
                    </div>
                )}

                {/* Profile section */}
                <div className="mr-4 flex items-center gap-2 max-w-max">
                    {/* notfication icon  */}
                    {/* {user?.role === "USER" && <NotificationBell />} */}

                    <span className="flex items-center gap-1">
                        Welcome, <NavbarUsername user={user} />
                    </span>

                    <Link href="/dashboard/profile">
                        <CircleUserRound className="w-8 h-8 stroke-1" />
                    </Link>
                </div>
            </div>
        </nav>
    );
}
export default Navbar;
