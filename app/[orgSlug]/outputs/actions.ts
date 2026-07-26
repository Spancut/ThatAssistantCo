"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/server/workspaces";
import { recordAuditEvent } from "@/lib/server/audit";
import {
  createApproval,
  createHumanValueEntry,
  getOutput,
  updateOutputAfterReview,
} from "@/lib/server/ai-workflows";
import {
  humanValueEntryFormSchema,
  outputReviewFormSchema,
  type HumanValueFormState,
  type ReviewFormState,
} from "@/lib/validations/ai";

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

export async function approveOutputAction(
  orgSlug: string,
  outputId: string,
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const parsed = outputReviewFormSchema.safeParse({
    subject: formData.get("subject"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, user, workspace } = await requireWorkspace(orgSlug);

  const output = await getOutput(supabase, workspace.id, outputId);
  if (!output) throw new Error("Output not found");
  if (output.status !== "draft") {
    return { error: "This draft has already been reviewed." };
  }

  const original = output.structured_content as Record<string, unknown>;
  // Trim both sides the same way: outputReviewFormSchema trims the
  // submitted subject/body, but the model's raw output can easily carry
  // trailing whitespace/newlines the reviewer never touched. Comparing a
  // trimmed value against an untrimmed one falsely flags an unedited
  // approval as "edited_and_approved" (caught live — real bug, not
  // hypothetical).
  const originalSubject = typeof original.subject === "string" ? original.subject.trim() : "";
  const originalBody = typeof original.body === "string" ? original.body.trim() : "";
  const wasEdited = parsed.data.subject !== originalSubject || parsed.data.body !== originalBody;

  await updateOutputAfterReview(supabase, workspace.id, outputId, {
    status: wasEdited ? "edited_and_approved" : "approved",
    draftContent: parsed.data.body,
    structuredContent: { ...original, subject: parsed.data.subject, body: parsed.data.body },
  });

  await createApproval(supabase, {
    outputId,
    approverId: user.id,
    status: wasEdited ? "edited_and_approved" : "approved",
    editedContent: wasEdited ? parsed.data.body : null,
  });

  await recordAuditEvent(supabase, {
    orgId: workspace.id,
    actorUserId: user.id,
    action: wasEdited ? "output.edited_and_approved" : "output.approved",
    targetType: "output",
    targetId: outputId,
    metadata: { workflow_run_id: output.workflow_run_id },
  });

  revalidatePath(`/${orgSlug}/outputs/${outputId}`);
  return { success: true };
}

export async function rejectOutputAction(
  orgSlug: string,
  outputId: string,
  _prevState: ReviewFormState,
  _formData: FormData
): Promise<ReviewFormState> {
  const { supabase, user, workspace } = await requireWorkspace(orgSlug);

  const output = await getOutput(supabase, workspace.id, outputId);
  if (!output) throw new Error("Output not found");
  if (output.status !== "draft") {
    return { error: "This draft has already been reviewed." };
  }

  await updateOutputAfterReview(supabase, workspace.id, outputId, {
    status: "rejected",
    draftContent: output.draft_content,
  });

  await createApproval(supabase, {
    outputId,
    approverId: user.id,
    status: "rejected",
    editedContent: null,
  });

  await recordAuditEvent(supabase, {
    orgId: workspace.id,
    actorUserId: user.id,
    action: "output.rejected",
    targetType: "output",
    targetId: outputId,
    metadata: { workflow_run_id: output.workflow_run_id },
  });

  revalidatePath(`/${orgSlug}/outputs/${outputId}`);
  return { success: true };
}

export async function saveHumanValueEntryAction(
  orgSlug: string,
  outputId: string,
  _prevState: HumanValueFormState,
  formData: FormData
): Promise<HumanValueFormState> {
  const parsed = humanValueEntryFormSchema.safeParse({
    contextAdded: formData.get("contextAdded"),
    judgmentApplied: formData.get("judgmentApplied"),
    preferenceConsidered: formData.get("preferenceConsidered"),
    riskIdentified: formData.get("riskIdentified"),
    recommendationMade: formData.get("recommendationMade"),
    correctionsMade: formData.get("correctionsMade"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, user, workspace } = await requireWorkspace(orgSlug);

  if (workspace.product_mode !== "partner") {
    throw new Error("Human value entries are only available for Partner workspaces");
  }

  await createHumanValueEntry(supabase, workspace.id, outputId, user.id, parsed.data);

  await recordAuditEvent(supabase, {
    orgId: workspace.id,
    actorUserId: user.id,
    action: "human_value_entry.created",
    targetType: "human_value_entry",
    targetId: outputId,
    metadata: {},
  });

  revalidatePath(`/${orgSlug}/outputs/${outputId}`);
  return { success: true };
}
