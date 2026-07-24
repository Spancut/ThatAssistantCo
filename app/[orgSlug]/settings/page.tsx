import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug, getWorkspaceMembers } from "@/lib/server/workspaces";
import { RenameWorkspaceForm } from "@/components/settings/rename-workspace-form";
import { MembersList } from "@/components/settings/members-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Settings — ThatAssistant" };

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspaceBySlug(supabase, orgSlug, user.id);
  if (!workspace) notFound();

  const members = await getWorkspaceMembers(supabase, workspace.id);
  const canRename = workspace.role === "owner" || workspace.role === "admin";

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your workspace.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>
            Product is set at creation and can&apos;t be changed —{" "}
            <span className="font-medium capitalize text-foreground">
              {workspace.product_mode}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RenameWorkspaceForm
            orgId={workspace.id}
            orgSlug={workspace.slug}
            currentName={workspace.name}
            canRename={canRename}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
          <CardDescription>
            Everyone with access to this workspace. Invitations aren&apos;t available yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-1" />
          <MembersList members={members} />
        </CardContent>
      </Card>
    </div>
  );
}
