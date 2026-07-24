import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/server/workspaces";
import { getRecentNotifications, getUnreadNotificationCount } from "@/lib/server/notifications";
import { AppShell } from "@/components/shell/app-shell";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workspace = await getWorkspaceBySlug(supabase, orgSlug, user.id);
  if (!workspace) {
    notFound();
  }

  const [notifications, unreadCount] = await Promise.all([
    getRecentNotifications(supabase, workspace.id, user.id),
    getUnreadNotificationCount(supabase, workspace.id, user.id),
  ]);

  return (
    <AppShell
      workspace={workspace}
      userEmail={user.email ?? ""}
      notifications={notifications}
      unreadCount={unreadCount}
    >
      {children}
    </AppShell>
  );
}
