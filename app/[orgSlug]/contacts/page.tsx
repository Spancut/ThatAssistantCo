import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/server/workspaces";
import { listContacts } from "@/lib/server/contacts";
import { ContactBoard } from "@/components/contacts/contact-board";
import { ContactForm } from "@/components/contacts/contact-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Contact & Lead Hub — ThatAssistant" };

export default async function ContactsPage({
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
  if (!workspace || workspace.product_mode !== "founder") notFound();

  const contacts = await listContacts(supabase, workspace.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Contact & Lead Hub
        </h1>
        <p className="mt-1 text-muted-foreground">
          Every lead and customer, grouped by where they are in your pipeline.
        </p>
      </div>

      {contacts.length === 0 ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base">No contacts yet</CardTitle>
            <CardDescription>
              Nothing is pre-filled — this list is genuinely empty until you add someone. Add your
              first contact below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm orgSlug={orgSlug} />
          </CardContent>
        </Card>
      ) : (
        <>
          <ContactBoard orgSlug={orgSlug} contacts={contacts} />
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base">Add a contact</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm orgSlug={orgSlug} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
