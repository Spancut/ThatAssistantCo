import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Archive } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/server/workspaces";
import { getClientProfile } from "@/lib/server/clients";
import { listKnowledgeItemsForClient } from "@/lib/server/knowledge";
import {
  archiveClientAction,
  addClientKnowledgeItemAction,
  deleteClientKnowledgeItemAction,
  generateClientDraftAction,
} from "@/app/[orgSlug]/clients/actions";
import { ClientForm } from "@/components/clients/client-form";
import { KnowledgeSection } from "@/components/knowledge/knowledge-section";
import { DraftGeneratorForm } from "@/components/ai/draft-generator-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { checkEntitlement } from "@/lib/server/entitlements";

export const metadata: Metadata = { title: "Client — ThatAssistant" };

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; clientId: string }>;
}) {
  const { orgSlug, clientId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspaceBySlug(supabase, orgSlug, user.id);
  if (!workspace || workspace.product_mode !== "partner") notFound();

  const client = await getClientProfile(supabase, workspace.id, clientId);
  if (!client) notFound();

  const knowledgeItems = await listKnowledgeItemsForClient(supabase, workspace.id, clientId);
  const entitlement = await checkEntitlement(workspace.id, "ai_generations_per_month", supabase);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link
          href={`/${orgSlug}/clients`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Client Hub
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{client.name}</h1>
          {client.archived_at ? <Badge variant="outline">Archived</Badge> : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Client details</CardTitle>
            {!client.archived_at ? (
              <form action={archiveClientAction.bind(null, orgSlug, client.id)}>
                <Button type="submit" variant="ghost" size="sm" className="gap-1.5">
                  <Archive className="size-3.5" />
                  Archive
                </Button>
              </form>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <ClientForm orgSlug={orgSlug} client={client} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <DraftGeneratorForm
            action={generateClientDraftAction.bind(null, orgSlug, clientId)}
            title="Draft email"
            description={`Draft an email to ${client.name}, in their brand voice, for you to review and send yourself.`}
            placeholder="What's this email about, or what did they ask?"
            buttonLabel="Draft email"
            remaining={entitlement.remaining}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Knowledge</CardTitle>
        </CardHeader>
        <CardContent>
          <KnowledgeSection
            items={knowledgeItems}
            addAction={addClientKnowledgeItemAction.bind(null, orgSlug, clientId)}
            deleteAction={deleteClientKnowledgeItemAction.bind(null, orgSlug, clientId)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
