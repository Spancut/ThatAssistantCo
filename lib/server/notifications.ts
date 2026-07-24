import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

/**
 * Creates a notification for a specific workspace member. This is the only
 * write path — there is no client-facing INSERT policy on `notifications`,
 * only a SECURITY DEFINER RPC that requires the caller and the recipient to
 * both be members of the workspace.
 *
 * `client` is an optional override for tests/scripts; production call
 * sites can omit it.
 */
export async function createNotification(
  workspaceId: string,
  userId: string,
  type: string,
  payload: Record<string, unknown> = {},
  client?: SupabaseClient<Database>
): Promise<NotificationRow> {
  const supabase = client ?? (await createClient());

  const { data, error } = await supabase.rpc("create_notification", {
    target_org_id: workspaceId,
    target_user_id: userId,
    notification_type: type,
    notification_payload: payload,
  });

  if (error || !data) {
    throw new Error(`Failed to create notification: ${error?.message ?? "unknown error"}`);
  }

  return data;
}

/** Most recent notifications for a user within a workspace, newest first. */
export async function getRecentNotifications(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  userId: string,
  limit = 10
): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("org_id", workspaceId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load notifications: ${error.message}`);
  }

  return data ?? [];
}

/** Exact unread count, independent of how many rows getRecentNotifications returns. */
export async function getUnreadNotificationCount(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("org_id", workspaceId)
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    throw new Error(`Failed to count unread notifications: ${error.message}`);
  }

  return count ?? 0;
}

export async function markNotificationRead(
  supabase: SupabaseClient<Database>,
  notificationId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to mark notification read: ${error.message}`);
  }
}
