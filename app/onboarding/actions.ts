"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createWorkspaceSchema } from "@/lib/validations/workspace";
import { recordAuditEvent } from "@/lib/server/audit";

export type CreateWorkspaceState = { error?: string };

export async function createWorkspaceAction(
  _prevState: CreateWorkspaceState,
  formData: FormData
): Promise<CreateWorkspaceState> {
  const parsed = createWorkspaceSchema.safeParse({
    name: formData.get("name"),
    productMode: formData.get("productMode"),
  });

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

  const { data: org, error } = await supabase.rpc("create_workspace", {
    workspace_name: parsed.data.name,
    mode: parsed.data.productMode,
  });

  if (error || !org) {
    return { error: error?.message ?? "Could not create workspace. Try again." };
  }

  await recordAuditEvent(supabase, {
    orgId: org.id,
    actorUserId: user.id,
    action: "workspace.created",
    targetType: "organization",
    targetId: org.id,
    metadata: { product_mode: org.product_mode },
  });

  redirect(`/${org.slug}/dashboard`);
}
