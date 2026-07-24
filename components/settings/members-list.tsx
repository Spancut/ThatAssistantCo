import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { WorkspaceMember } from "@/lib/server/workspaces";

const roleLabels: Record<WorkspaceMember["role"], string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  client_reviewer: "Client reviewer",
  certified_operator: "Certified operator",
};

export function MembersList({ members }: { members: WorkspaceMember[] }) {
  return (
    <ul className="divide-y divide-border">
      {members.map((member) => (
        <li key={member.userId} className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">
                {(member.fullName ?? "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">
              {member.fullName ?? "Unnamed member"}
            </span>
          </div>
          <Badge variant="outline">{roleLabels[member.role]}</Badge>
        </li>
      ))}
    </ul>
  );
}
