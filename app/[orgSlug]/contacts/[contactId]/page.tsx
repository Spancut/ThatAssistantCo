import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/server/workspaces";
import { getContact } from "@/lib/server/contacts";
import { listKnowledgeItemsForContact } from "@/lib/server/knowledge";
import {
  addContactKnowledgeItemAction,
  deleteContactKnowledgeItemAction,
} from "@/app/[orgSlug]/contacts/actions";
import { ContactForm } from "@/components/contacts/contact-form";
import { KnowledgeSection } from "@/components/knowledge/knowledge-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PIPELINE_STAGE_LABELS } from "@/lib/validations/contact";

export const metadata: Metadata = { title: "Contact — ThatAssistant" };

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; contactId: string }>;
}) {
  const { orgSlug, contactId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspaceBySlug(supabase, orgSlug, user.id);
  if (!workspace || workspace.product_mode !== "founder") notFound();

  const contact = await getContact(supabase, workspace.id, contactId);
  if (!contact) notFound();

  const knowledgeItems = await listKnowledgeItemsForContact(supabase, workspace.id, contactId);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link
          href={`/${orgSlug}/contacts`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Contact & Lead Hub
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {contact.name}
          </h1>
          <Badge variant="secondary">{PIPELINE_STAGE_LABELS[contact.pipeline_stage]}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact details</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm orgSlug={orgSlug} contact={contact} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Knowledge</CardTitle>
        </CardHeader>
        <CardContent>
          <KnowledgeSection
            items={knowledgeItems}
            addAction={addContactKnowledgeItemAction.bind(null, orgSlug, contactId)}
            deleteAction={deleteContactKnowledgeItemAction.bind(null, orgSlug, contactId)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
