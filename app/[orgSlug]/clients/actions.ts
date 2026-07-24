"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/server/workspaces";
import { recordAuditEvent } from "@/lib/server/audit";
import {
  archiveClientProfile,
  createClientProfile,
  updateClientProfile,
} from "@/lib/server/clients";
import { createKnowledgeItem, deleteKnowledgeItem } from "@/lib/server/knowledge";
import { clientProfileFormSchema } from "@/lib/validations/client";
import {
  knowledgeItemFormSchema,
  parseTagsInput,
  type KnowledgeItemFormState,
} from "@/lib/validations/knowledge";

export type ClientFormState = { error?: string; success?: boolean };

function parseClientForm(formData: FormData) {
  return clientProfileFormSchema.safeParse({
    name: formData.get("name"),
    brandVoice: formData.get("brandVoice"),
    preferencesNotes: formData.get("preferencesNotes"),
    keyFactsNotes: formData.get("keyFactsNotes"),
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

export async function createClientAction(
  orgSlug: string,
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, user, workspace } = await requireWorkspace(orgSlug);

  const client = await createClientProfile(supabase, workspace.id, user.id, {
    name: parsed.data.name,
    brandVoice: parsed.data.brandVoice,
    preferences: { notes: parsed.data.preferencesNotes },
    keyFacts: { notes: parsed.data.keyFactsNotes },
  });

  await recordAuditEvent(supabase, {
    orgId: workspace.id,
    actorUserId: user.id,
    action: "client_profile.created",
    targetType: "client_profile",
    targetId: client.id,
    metadata: { name: client.name },
  });

  revalidatePath(`/${orgSlug}/clients`);
  redirect(`/${orgSlug}/clients/${client.id}`);
}

export async function updateClientAction(
  orgSlug: string,
  clientId: string,
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, user, workspace } = await requireWorkspace(orgSlug);

  await updateClientProfile(supabase, workspace.id, clientId, {
    name: parsed.data.name,
    brandVoice: parsed.data.brandVoice,
    preferences: { notes: parsed.data.preferencesNotes },
    keyFacts: { notes: parsed.data.keyFactsNotes },
  });

  await recordAuditEvent(supabase, {
    orgId: workspace.id,
    actorUserId: user.id,
    action: "client_profile.updated",
    targetType: "client_profile",
    targetId: clientId,
    metadata: { name: parsed.data.name },
  });

  revalidatePath(`/${orgSlug}/clients/${clientId}`);
  revalidatePath(`/${orgSlug}/clients`);

  return { success: true };
}

export async function archiveClientAction(orgSlug: string, clientId: string): Promise<void> {
  const { supabase, user, workspace } = await requireWorkspace(orgSlug);

  await archiveClientProfile(supabase, workspace.id, clientId);

  await recordAuditEvent(supabase, {
    orgId: workspace.id,
    actorUserId: user.id,
    action: "client_profile.archived",
    targetType: "client_profile",
    targetId: clientId,
    metadata: {},
  });

  revalidatePath(`/${orgSlug}/clients`);
  redirect(`/${orgSlug}/clients`);
}

export async function addClientKnowledgeItemAction(
  orgSlug: string,
  clientId: string,
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
    linkedClientProfileId: clientId,
  });

  await recordAuditEvent(supabase, {
    orgId: workspace.id,
    actorUserId: user.id,
    action: "knowledge_base_item.created",
    targetType: "knowledge_base_item",
    targetId: item.id,
    metadata: { title: item.title, linked_client_profile_id: clientId },
  });

  revalidatePath(`/${orgSlug}/clients/${clientId}`);
  return {};
}

export async function deleteClientKnowledgeItemAction(
  orgSlug: string,
  clientId: string,
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

  revalidatePath(`/${orgSlug}/clients/${clientId}`);
}
