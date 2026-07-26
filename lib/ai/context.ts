import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { getClientProfile } from "@/lib/server/clients";
import { getContact } from "@/lib/server/contacts";
import { listKnowledgeItemsForClient, listKnowledgeItemsForContact } from "@/lib/server/knowledge";
import type { AssembledContext } from "./types";

/**
 * Partner context: brand_voice/preferences/key_facts plus any knowledge
 * items linked to this client. This — not a different prompt or a
 * different model call — is where Partner and Founder actually differ.
 */
export async function assembleClientContext(
  supabase: SupabaseClient<Database>,
  orgId: string,
  clientId: string
): Promise<AssembledContext> {
  const client = await getClientProfile(supabase, orgId, clientId);
  if (!client) {
    throw new Error("Client not found");
  }

  const knowledgeItems = await listKnowledgeItemsForClient(supabase, orgId, clientId);

  return {
    sourceType: "client",
    sourceId: client.id,
    sourceName: client.name,
    brandVoice: client.brand_voice,
    preferences: client.preferences,
    keyFacts: client.key_facts,
    knowledgeItems: knowledgeItems.map((item) => ({
      title: item.title,
      content: item.content,
      tags: item.tags,
    })),
  };
}

/** Founder context: notes/pipeline_stage plus any linked knowledge items. */
export async function assembleContactContext(
  supabase: SupabaseClient<Database>,
  orgId: string,
  contactId: string
): Promise<AssembledContext> {
  const contact = await getContact(supabase, orgId, contactId);
  if (!contact) {
    throw new Error("Contact not found");
  }

  const knowledgeItems = await listKnowledgeItemsForContact(supabase, orgId, contactId);

  return {
    sourceType: "contact",
    sourceId: contact.id,
    sourceName: contact.name,
    notes: contact.notes,
    pipelineStage: contact.pipeline_stage,
    knowledgeItems: knowledgeItems.map((item) => ({
      title: item.title,
      content: item.content,
      tags: item.tags,
    })),
  };
}
