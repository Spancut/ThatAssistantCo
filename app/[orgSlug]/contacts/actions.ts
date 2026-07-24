"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/server/workspaces";
import { recordAuditEvent } from "@/lib/server/audit";
import { createContact, updateContact, updateContactPipelineStage } from "@/lib/server/contacts";
import { createKnowledgeItem, deleteKnowledgeItem } from "@/lib/server/knowledge";
import { contactFormSchema, updatePipelineStageSchema } from "@/lib/validations/contact";
import {
  knowledgeItemFormSchema,
  parseTagsInput,
  type KnowledgeItemFormState,
} from "@/lib/validations/knowledge";
import type { PipelineStage } from "@/lib/types/database";

export type ContactFormState = { error?: string; success?: boolean };

function parseContactForm(formData: FormData) {
  return contactFormSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    source: formData.get("source"),
    notes: formData.get("notes"),
    pipelineStage: formData.get("pipelineStage") || undefined,
  });
}

async function requireWorkspace(orgSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspaceBySlug(supabase, orgSlug, user.id);
  if (!workspace) throw new Error("Workspace not found");

  return { supabase, user, workspace };
}

export async function createContactAction(
  orgSlug: string,
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = parseContactForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, user, workspace } = await requireWorkspace(orgSlug);

  const contact = await createContact(supabase, workspace.id, user.id, parsed.data);

  await recordAuditEvent(supabase, {
    orgId: workspace.id,
    actorUserId: user.id,
    action: "contact.created",
    targetType: "contact",
    targetId: contact.id,
    metadata: { name: contact.name, pipeline_stage: contact.pipeline_stage },
  });

  revalidatePath(`/${orgSlug}/contacts`);
  redirect(`/${orgSlug}/contacts/${contact.id}`);
}

export async function updateContactAction(
  orgSlug: string,
  contactId: string,
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = parseContactForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, user, workspace } = await requireWorkspace(orgSlug);

  await updateContact(supabase, workspace.id, contactId, parsed.data);

  await recordAuditEvent(supabase, {
    orgId: workspace.id,
    actorUserId: user.id,
    action: "contact.updated",
    targetType: "contact",
    targetId: contactId,
    metadata: { name: parsed.data.name },
  });

  revalidatePath(`/${orgSlug}/contacts/${contactId}`);
  revalidatePath(`/${orgSlug}/contacts`);

  return { success: true };
}

export type StageFormState = { error?: string };

export async function updateContactStageAction(
  orgSlug: string,
  contactId: string,
  fromStage: PipelineStage,
  _prevState: StageFormState,
  formData: FormData
): Promise<StageFormState> {
  const parsed = updatePipelineStageSchema.safeParse({
    pipelineStage: formData.get("pipelineStage"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid stage" };
  }

  const { supabase, user, workspace } = await requireWorkspace(orgSlug);

  await updateContactPipelineStage(supabase, workspace.id, contactId, parsed.data.pipelineStage);

  await recordAuditEvent(supabase, {
    orgId: workspace.id,
    actorUserId: user.id,
    action: "contact.stage_changed",
    targetType: "contact",
    targetId: contactId,
    metadata: { from: fromStage, to: parsed.data.pipelineStage },
  });

  revalidatePath(`/${orgSlug}/contacts/${contactId}`);
  revalidatePath(`/${orgSlug}/contacts`);

  return {};
}

export async function addContactKnowledgeItemAction(
  orgSlug: string,
  contactId: string,
  _prevState: KnowledgeItemFormState,
  formData: FormData
): Promise<KnowledgeItemFormState> {
  const parsed = knowledgeItemFormSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    tags: formData.get("tags"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, user, workspace } = await requireWorkspace(orgSlug);

  const item = await createKnowledgeItem(supabase, workspace.id, user.id, {
    title: parsed.data.title,
    content: parsed.data.content,
    tags: parseTagsInput(parsed.data.tags),
    linkedContactId: contactId,
  });

  await recordAuditEvent(supabase, {
    orgId: workspace.id,
    actorUserId: user.id,
    action: "knowledge_base_item.created",
    targetType: "knowledge_base_item",
    targetId: item.id,
    metadata: { title: item.title, linked_contact_id: contactId },
  });

  revalidatePath(`/${orgSlug}/contacts/${contactId}`);
  return {};
}

export async function deleteContactKnowledgeItemAction(
  orgSlug: string,
  contactId: string,
  itemId: string
): Promise<void> {
  const { supabase, user, workspace } = await requireWorkspace(orgSlug);

  await deleteKnowledgeItem(supabase, workspace.id, itemId);

  await recordAuditEvent(supabase, {
    orgId: workspace.id,
    actorUserId: user.id,
    action: "knowledge_base_item.deleted",
    targetType: "knowledge_base_item",
    targetId: itemId,
    metadata: {},
  });

  revalidatePath(`/${orgSlug}/contacts/${contactId}`);
}
