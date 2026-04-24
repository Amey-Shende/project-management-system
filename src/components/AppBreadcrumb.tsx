"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "./ui/breadcrumb";
import React from "react";

const pageTitleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/project-manager": "Project Manager",
    "/dashboard/team-lead": "Team Lead",
    "/dashboard/team-member": "Team Member",
    "/dashboard/profile": "My Profile",
    "/dashboard/projects": "Projects",
};

const dynamicPagePatterns: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /^\/dashboard\/projects\/\d+$/, label: "Project Detail" },
    { pattern: /^\/dashboard\/team-member\/\d+$/, label: "Member Detail" },
    { pattern: /^\/dashboard\/team-lead\/\d+$/, label: "Team Lead Detail" },
    { pattern: /^\/dashboard\/project-manager\/\d+$/, label: "Project Manager Detail" },
];

function AppBreadcrumb() {
    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter(Boolean);

    const breadcrumbItems = pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
        
        let label = pageTitleMap[href];
        if (!label) {
            const matchedPattern = dynamicPagePatterns.find((item) =>
                href.match(item.pattern)
            );
            if (matchedPattern) {
                label = matchedPattern.label;
            } else {
                label = segment
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
            }
        }
        return {
            href,
            label,
            isCurrent: index === pathSegments.length - 1,
        };
    });

    return (
        <div className="px-4 py-2">
            <Breadcrumb>
                <BreadcrumbList>
                    {breadcrumbItems.map((item) => (
                        <React.Fragment key={item.href}>
                            <BreadcrumbItem className={item.isCurrent ? "" : "hidden md:block"}>
                                {item.isCurrent ? (
                                    <BreadcrumbPage className="text-lg font-semibold">
                                        {item.label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={item.href}>{item.label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!item.isCurrent && <BreadcrumbSeparator className="hidden md:block" />}
                        </React.Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}

export default AppBreadcrumb;
