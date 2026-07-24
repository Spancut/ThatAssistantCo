import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/server/workspaces";
import { listClientProfiles } from "@/lib/server/clients";
import { ClientList } from "@/components/clients/client-list";
import { ClientForm } from "@/components/clients/client-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Client Hub — ThatAssistant" };

export default async function ClientsPage({
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
  if (!workspace || workspace.product_mode !== "partner") notFound();

  const clients = await listClientProfiles(supabase, workspace.id);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Client Hub</h1>
        <p className="mt-1 text-muted-foreground">
          This is where client context lives — brand voice, preferences, and the knowledge that
          keeps drafts accurate.
        </p>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No clients yet</CardTitle>
            <CardDescription>
              Nothing is pre-filled — this list is genuinely empty until you add someone. Add your
              first client below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientForm orgSlug={orgSlug} />
          </CardContent>
        </Card>
      ) : (
        <>
          <ClientList orgSlug={orgSlug} clients={clients} />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add a client</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientForm orgSlug={orgSlug} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
