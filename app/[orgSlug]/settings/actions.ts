"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { renameWorkspaceSchema } from "@/lib/validations/workspace";
import { recordAuditEvent } from "@/lib/server/audit";

export type RenameWorkspaceState = { error?: string; success?: boolean; updatedAt?: number };

export async function renameWorkspaceAction(
  orgId: string,
  orgSlug: string,
  _prevState: RenameWorkspaceState,
  formData: FormData
): Promise<RenameWorkspaceState> {
  const parsed = renameWorkspaceSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // RLS (organizations_update_admin) silently filters this update to zero
  // rows if the caller isn't an owner/admin of this org — no separate
  // application-layer role check is needed for correctness, only for a
  // clearer error message below.
  const { data, error } = await supabase
    .from("organizations")
    .update({ name: parsed.data.name })
    .eq("id", orgId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }
  if (!data) {
    return { error: "You don't have permission to rename this workspace." };
  }

  await recordAuditEvent(supabase, {
    orgId,
    actorUserId: user.id,
    action: "workspace.renamed",
    targetType: "organization",
    targetId: orgId,
    metadata: { name: parsed.data.name },
  });

  revalidatePath(`/${orgSlug}/settings`);
  revalidatePath(`/${orgSlug}/dashboard`);

  return { success: true, updatedAt: Date.now() };
}
