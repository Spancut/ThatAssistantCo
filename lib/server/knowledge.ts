import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export type KnowledgeBaseItem = Database["public"]["Tables"]["knowledge_base_items"]["Row"];

export async function listKnowledgeItemsForClient(
  supabase: SupabaseClient<Database>,
  orgId: string,
  clientId: string
): Promise<KnowledgeBaseItem[]> {
  const { data, error } = await supabase
    .from("knowledge_base_items")
    .select("*")
    .eq("org_id", orgId)
    .eq("linked_client_profile_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load knowledge items: ${error.message}`);
  return data ?? [];
}

export async function listKnowledgeItemsForContact(
  supabase: SupabaseClient<Database>,
  orgId: string,
  contactId: string
): Promise<KnowledgeBaseItem[]> {
  const { data, error } = await supabase
    .from("knowledge_base_items")
    .select("*")
    .eq("org_id", orgId)
    .eq("linked_contact_id", contactId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load knowledge items: ${error.message}`);
  return data ?? [];
}

export type KnowledgeItemWrite = {
  title: string;
  content: string;
  tags: string[];
  linkedClientProfileId?: string | null;
  linkedContactId?: string | null;
};

export async function createKnowledgeItem(
  supabase: SupabaseClient<Database>,
  orgId: string,
  createdBy: string,
  input: KnowledgeItemWrite
): Promise<KnowledgeBaseItem> {
  const { data, error } = await supabase
    .from("knowledge_base_items")
    .insert({
      org_id: orgId,
      created_by: createdBy,
      title: input.title,
      content: input.content,
      tags: input.tags,
      linked_client_profile_id: input.linkedClientProfileId ?? null,
      linked_contact_id: input.linkedContactId ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create knowledge item: ${error.message}`);
  return data;
}

export async function deleteKnowledgeItem(
  supabase: SupabaseClient<Database>,
  orgId: string,
  itemId: string
): Promise<void> {
  const { error } = await supabase
    .from("knowledge_base_items")
    .delete()
    .eq("org_id", orgId)
    .eq("id", itemId);

  if (error) throw new Error(`Failed to delete knowledge item: ${error.message}`);
}
