import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export type ClientProfile = Database["public"]["Tables"]["client_profiles"]["Row"];

export async function listClientProfiles(
  supabase: SupabaseClient<Database>,
  orgId: string,
  { includeArchived = false }: { includeArchived?: boolean } = {}
): Promise<ClientProfile[]> {
  let query = supabase.from("client_profiles").select("*").eq("org_id", orgId);
  if (!includeArchived) {
    query = query.is("archived_at", null);
  }

  const { data, error } = await query.order("name", { ascending: true });
  if (error) throw new Error(`Failed to load clients: ${error.message}`);
  return data ?? [];
}

export async function countActiveClientProfiles(
  supabase: SupabaseClient<Database>,
  orgId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("client_profiles")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .is("archived_at", null);

  if (error) throw new Error(`Failed to count clients: ${error.message}`);
  return count ?? 0;
}

export async function getClientProfile(
  supabase: SupabaseClient<Database>,
  orgId: string,
  clientId: string
): Promise<ClientProfile | null> {
  const { data, error } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", clientId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load client: ${error.message}`);
  return data;
}

export type ClientProfileWrite = {
  name: string;
  brandVoice: string;
  preferences: Record<string, unknown>;
  keyFacts: Record<string, unknown>;
};

export async function createClientProfile(
  supabase: SupabaseClient<Database>,
  orgId: string,
  createdBy: string,
  input: ClientProfileWrite
): Promise<ClientProfile> {
  const { data, error } = await supabase
    .from("client_profiles")
    .insert({
      org_id: orgId,
      created_by: createdBy,
      name: input.name,
      brand_voice: input.brandVoice || null,
      preferences: input.preferences,
      key_facts: input.keyFacts,
    })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create client: ${error.message}`);
  return data;
}

export async function updateClientProfile(
  supabase: SupabaseClient<Database>,
  orgId: string,
  clientId: string,
  input: ClientProfileWrite
): Promise<ClientProfile> {
  const { data, error } = await supabase
    .from("client_profiles")
    .update({
      name: input.name,
      brand_voice: input.brandVoice || null,
      preferences: input.preferences,
      key_facts: input.keyFacts,
    })
    .eq("org_id", orgId)
    .eq("id", clientId)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to update client: ${error.message}`);
  return data;
}

export async function archiveClientProfile(
  supabase: SupabaseClient<Database>,
  orgId: string,
  clientId: string
): Promise<ClientProfile> {
  const { data, error } = await supabase
    .from("client_profiles")
    .update({ archived_at: new Date().toISOString() })
    .eq("org_id", orgId)
    .eq("id", clientId)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to archive client: ${error.message}`);
  return data;
}
