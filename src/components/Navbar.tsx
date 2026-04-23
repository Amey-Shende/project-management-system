"use client";
import { SidebarTrigger } from "./ui/sidebar";
import { CircleUserRound } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import AppBreadcrumb from "./AppBreadcrumb";

const NavbarUsername = dynamic(() => import("./NavbarUsername"), { ssr: false });

function Navbar({ user }: { user: { id: string; name: string; email: string; role: string } | null }) {
    // Keep input in sync with URL (important on back/forward and server navigations)
    // useEffect(() => {
    //     if (!isTodoPage) return;
    //     startTransition(() => {
    //         setQ(searchParams.get("q") ?? "");
    //     });
    // }, [isTodoPage, searchParams]);

    // useEffect(() => {
    //     if (!isTodoPage) return;

    //     const t = setTimeout(() => {
    //         const params = new URLSearchParams(searchParams.toString());
    //         const nextQ = q.trim();
    //         const currentQ = searchParams.get("q") ?? "";

    //         if (nextQ) params.set("q", nextQ);
    //         else params.delete("q");

    //         // Prevent redundant replace
    //         if (nextQ === currentQ) return;

    //         const qs = params.toString();
    //         router.replace(qs ? `${pathname}?${qs}` : pathname);
    //     }, 300);

    //     return () => clearTimeout(t);
    // }, [q, isTodoPage, pathname, router, searchParams]);


    // const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setQ(e.target.value);
    // }
    
    return (
        <nav className="h-15 w-full flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <AppBreadcrumb />
            </div>

            <div className="flex items-center">
                {/* {isTodoPage && (
                    <div className="mr-10 flex items-center gap-2 relative">
                        <Search className="size-4.5 absolute left-2 top-1/2 transform -translate-y-1/2" />
                        <Input
                            value={q}
                            onChange={handleSearch}
                            placeholder="Search tasks..."
                            className="md:w-100 bg-white pl-8"
                        />
                    </div>
                )} */}

                {/* Profile section */}
                <div className="mr-4 flex items-center gap-2 max-w-max">
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
