import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export type AuditEventInput = {
  orgId: string;
  actorUserId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Records an audit event for a consequential, org-scoped action.
 *
 * Takes the caller's own authenticated Supabase client (not a service-role
 * client) so the insert is subject to the same RLS policy every other write
 * is: the actor can only write events for themselves, into an org they
 * belong to. See supabase/migrations and docs/security-and-approval-policy.md.
 */
export async function recordAuditEvent(
  supabase: SupabaseClient<Database>,
  input: AuditEventInput
): Promise<void> {
  if (!input.orgId || !input.actorUserId || !input.action || !input.targetType) {
    throw new Error("recordAuditEvent: orgId, actorUserId, action, and targetType are required");
  }

  const { error } = await supabase.from("audit_events").insert({
    org_id: input.orgId,
    actor_user_id: input.actorUserId,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    throw new Error(`Failed to record audit event "${input.action}": ${error.message}`);
  }
}
