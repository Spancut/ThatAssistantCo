import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, MembershipRole } from "@/lib/types/database";

export type WorkspaceSummary = Database["public"]["Tables"]["organizations"]["Row"] & {
  role: MembershipRole;
};

export type WorkspaceMember = {
  userId: string;
  role: MembershipRole;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

/** All workspaces the given user belongs to, with their role in each. */
export async function getUserWorkspaces(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<WorkspaceSummary[]> {
  const { data: memberships, error: membershipError } = await supabase
    .from("memberships")
    .select("org_id, role")
    .eq("user_id", userId);

  if (membershipError) {
    throw new Error(`Failed to load memberships: ${membershipError.message}`);
  }
  if (!memberships || memberships.length === 0) return [];

  const orgIds = memberships.map((m) => m.org_id);

  const { data: orgs, error: orgsError } = await supabase
    .from("organizations")
    .select("*")
    .in("id", orgIds)
    .order("created_at", { ascending: true });

  if (orgsError) {
    throw new Error(`Failed to load organizations: ${orgsError.message}`);
  }

  const roleByOrgId = new Map(memberships.map((m) => [m.org_id, m.role]));

  return (orgs ?? []).map((org) => ({ ...org, role: roleByOrgId.get(org.id)! }));
}

/**
 * A single workspace by slug, scoped to the given user's membership.
 * Returns null both when the slug doesn't exist and when the user isn't a
 * member — the two cases are deliberately indistinguishable to the caller.
 */
export async function getWorkspaceBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
  userId: string
): Promise<WorkspaceSummary | null> {
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (orgError) throw new Error(`Failed to load workspace: ${orgError.message}`);
  if (!org) return null;

  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("role")
    .eq("org_id", org.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError) {
    throw new Error(`Failed to load membership: ${membershipError.message}`);
  }
  if (!membership) return null;

  return { ...org, role: membership.role };
}

/** Members of a workspace, joined with their profile info. */
export async function getWorkspaceMembers(
  supabase: SupabaseClient<Database>,
  orgId: string
): Promise<WorkspaceMember[]> {
  const { data: memberships, error: membershipError } = await supabase
    .from("memberships")
    .select("user_id, role, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });

  if (membershipError) {
    throw new Error(`Failed to load members: ${membershipError.message}`);
  }
  if (!memberships || memberships.length === 0) return [];

  const userIds = memberships.map((m) => m.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);

  if (profilesError) {
    throw new Error(`Failed to load member profiles: ${profilesError.message}`);
  }

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return memberships.map((m) => ({
    userId: m.user_id,
    role: m.role,
    fullName: profileById.get(m.user_id)?.full_name ?? null,
    avatarUrl: profileById.get(m.user_id)?.avatar_url ?? null,
    createdAt: m.created_at,
  }));
}
