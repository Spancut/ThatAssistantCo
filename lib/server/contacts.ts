import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PipelineStage } from "@/lib/types/database";

export type Contact = Database["public"]["Tables"]["contacts"]["Row"];

export async function listContacts(
  supabase: SupabaseClient<Database>,
  orgId: string
): Promise<Contact[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load contacts: ${error.message}`);
  return data ?? [];
}

export async function countContacts(
  supabase: SupabaseClient<Database>,
  orgId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId);

  if (error) throw new Error(`Failed to count contacts: ${error.message}`);
  return count ?? 0;
}

export async function getContact(
  supabase: SupabaseClient<Database>,
  orgId: string,
  contactId: string
): Promise<Contact | null> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", contactId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load contact: ${error.message}`);
  return data;
}

export type ContactWrite = {
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  notes: string;
  pipelineStage: PipelineStage;
};

export async function createContact(
  supabase: SupabaseClient<Database>,
  orgId: string,
  createdBy: string,
  input: ContactWrite
): Promise<Contact> {
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      org_id: orgId,
      created_by: createdBy,
      name: input.name,
      company: input.company || null,
      email: input.email || null,
      phone: input.phone || null,
      source: input.source || null,
      notes: input.notes || null,
      pipeline_stage: input.pipelineStage,
    })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create contact: ${error.message}`);
  return data;
}

export async function updateContact(
  supabase: SupabaseClient<Database>,
  orgId: string,
  contactId: string,
  input: ContactWrite
): Promise<Contact> {
  const { data, error } = await supabase
    .from("contacts")
    .update({
      name: input.name,
      company: input.company || null,
      email: input.email || null,
      phone: input.phone || null,
      source: input.source || null,
      notes: input.notes || null,
      pipeline_stage: input.pipelineStage,
    })
    .eq("org_id", orgId)
    .eq("id", contactId)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to update contact: ${error.message}`);
  return data;
}

export async function updateContactPipelineStage(
  supabase: SupabaseClient<Database>,
  orgId: string,
  contactId: string,
  pipelineStage: PipelineStage
): Promise<Contact> {
  const { data, error } = await supabase
    .from("contacts")
    .update({ pipeline_stage: pipelineStage })
    .eq("org_id", orgId)
    .eq("id", contactId)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to update pipeline stage: ${error.message}`);
  return data;
}
