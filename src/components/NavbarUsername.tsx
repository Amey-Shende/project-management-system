"use client";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function NavbarUsername({ user }: { user: { name: string } | null }) {

    return (
        <Tooltip>
            <TooltipTrigger>
                <span className="font-semibold max-w-22 truncate inline-block pt-2 cursor-pointer">
                    {user?.name ?? "Guest"}
                </span>
            </TooltipTrigger>
            {user?.name && user.name.length > 8 &&
                <TooltipContent>
                    {user?.name ?? "Guest"}
                </TooltipContent>
            }
        </Tooltip >
    )
}

export default NavbarUsername;
