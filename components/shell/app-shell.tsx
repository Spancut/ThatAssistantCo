import { Briefcase, Compass } from "lucide-react";
import type { WorkspaceSummary } from "@/lib/server/workspaces";
import type { NotificationRow } from "@/lib/server/notifications";
import { Badge } from "@/components/ui/badge";
import { ModeNav } from "@/components/shell/mode-nav";
import { UserMenu } from "@/components/shell/user-menu";
import { NotificationBell } from "@/components/shell/notification-bell";

export function AppShell({
  workspace,
  userEmail,
  notifications,
  unreadCount,
  children,
}: {
  workspace: WorkspaceSummary;
  userEmail: string;
  notifications: NotificationRow[];
  unreadCount: number;
  children: React.ReactNode;
}) {
  const ModeIcon = workspace.product_mode === "founder" ? Compass : Briefcase;

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              ThatAssistant
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">{workspace.name}</span>
            <Badge variant="secondary" className="gap-1 capitalize">
              <ModeIcon className="size-3" />
              {workspace.product_mode}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <ModeNav orgSlug={workspace.slug} productMode={workspace.product_mode} />
            <NotificationBell initialNotifications={notifications} initialUnreadCount={unreadCount} />
            <UserMenu email={userEmail} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
