"use client";
import { SidebarTrigger } from "./ui/sidebar";
import { CircleUserRound, Search, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import AppBreadcrumb from "./AppBreadcrumb";
import { Input } from "./ui/input";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

const NavbarUsername = dynamic(() => import("./NavbarUsername"), {
  ssr: false,
});

function Navbar({
  user,
}: {
  user: { id: string; name: string; email: string; role: string } | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(search);

  // Determine if current page is a listing page
  const isListingPage = [
    "/dashboard/projects",
    "/dashboard/project-manager",
    "/dashboard/team-lead",
    "/dashboard/team-member",
  ].includes(pathname);

  // Get placeholder based on current path
  const getPlaceholder = () => {
    switch (pathname) {
      case "/dashboard/projects":
        return "Search projects";
      case "/dashboard/project-manager":
        return "Search project managers";
      case "/dashboard/team-lead":
        return "Search team leads";
      case "/dashboard/team-member":
        return "Search team members";
      default:
        return "Search";
    }
  };

  // Keep input in sync with URL
  useEffect(() => {
    if (!isListingPage) return;
    setSearchQuery(search);
  }, [search]);

  // Debounced search handler
  useEffect(() => {
    if (!isListingPage) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmedQuery = searchQuery.trim();

      if (trimmedQuery) {
        params.set("search", trimmedQuery);
      } else {
        params.delete("search");
      }

      // Update URL without page reload
      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      window.history.replaceState({}, "", newUrl);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, pathname, search, isListingPage]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <nav className="h-15 w-full flex items-center justify-between px-3">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <AppBreadcrumb />
      </div>

      <div className="flex items-center">
        {isListingPage && (
          <div className="mr-10 flex items-center gap-2 relative">
            <Search className="size-4.5 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getPlaceholder()}
              className="md:w-100 bg-white pl-8 pr-8 h-10"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}

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
