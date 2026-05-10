import { generateColor } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { removeDuplicatesByKey } from "@/lib/arrayUtils";

export interface TeamMember {
  id: number;
  name: string;
  email?: string;
}

interface TeamAvatarsProps {
  members: TeamMember[];
  emptyMessage?: string;
  showNameWhenSingle?: boolean;
  size?: "sm" | "md";
}

export function TeamAvatars({
  members,
  emptyMessage = "Not assigned",
  showNameWhenSingle = true,
  size = "sm",
}: TeamAvatarsProps) {
  const sizeClasses = size === "sm" ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm";

  if (!members || members.length === 0) {
    return (
      <span className="text-sm text-muted-foreground">{emptyMessage}</span>
    );
  }
  const uniqueUsers = removeDuplicatesByKey(members, "id");

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {uniqueUsers?.map((member) => (
          <div key={member.id} className="flex">
            <div
              className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeClasses}`}
              style={{
                backgroundColor: generateColor(member.name, member.id),
              }}
            >
              <Tooltip>
                <TooltipTrigger>
                  {member.name
                    .split(" ")
                    .map((p: string) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </TooltipTrigger>
                {uniqueUsers.length > 1 && (
                  <TooltipContent>
                    <p>{member.name}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
            {showNameWhenSingle && uniqueUsers.length === 1 && (
              <div className="min-w-0 pt-1 ps-1">
                <p className="truncate text-sm">{member.name}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
