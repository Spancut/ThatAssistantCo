import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApprovalStatus, Database, OutputStatus, WorkflowRunStatus } from "@/lib/types/database";

export type WorkflowTemplate = Database["public"]["Tables"]["workflow_templates"]["Row"];
export type WorkflowRun = Database["public"]["Tables"]["workflow_runs"]["Row"];
export type Output = Database["public"]["Tables"]["outputs"]["Row"];
export type Approval = Database["public"]["Tables"]["approvals"]["Row"];
export type HumanValueEntry = Database["public"]["Tables"]["human_value_entries"]["Row"];

export async function getWorkflowTemplateByKey(
  supabase: SupabaseClient<Database>,
  key: string
): Promise<WorkflowTemplate | null> {
  const { data, error } = await supabase
    .from("workflow_templates")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (error) throw new Error(`Failed to load workflow template: ${error.message}`);
  return data;
}

export async function createWorkflowRun(
  supabase: SupabaseClient<Database>,
  input: {
    workflowTemplateId: string;
    orgId: string;
    initiatedBy: string;
    inputSnapshot: Record<string, unknown>;
  }
): Promise<WorkflowRun> {
  const { data, error } = await supabase
    .from("workflow_runs")
    .insert({
      workflow_template_id: input.workflowTemplateId,
      org_id: input.orgId,
      initiated_by: input.initiatedBy,
      input_snapshot: input.inputSnapshot,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create workflow run: ${error.message}`);
  return data;
}

export async function updateWorkflowRunStatus(
  supabase: SupabaseClient<Database>,
  orgId: string,
  runId: string,
  status: WorkflowRunStatus
): Promise<void> {
  const { error } = await supabase
    .from("workflow_runs")
    .update({ status })
    .eq("org_id", orgId)
    .eq("id", runId);

  if (error) throw new Error(`Failed to update workflow run status: ${error.message}`);
}

export async function getWorkflowRun(
  supabase: SupabaseClient<Database>,
  orgId: string,
  runId: string
): Promise<WorkflowRun | null> {
  const { data, error } = await supabase
    .from("workflow_runs")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", runId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load workflow run: ${error.message}`);
  return data;
}

export async function createOutput(
  supabase: SupabaseClient<Database>,
  input: {
    workflowRunId: string;
    orgId: string;
    outputType: string;
    draftContent: string;
    structuredContent: Record<string, unknown>;
  }
): Promise<Output> {
  const { data, error } = await supabase
    .from("outputs")
    .insert({
      workflow_run_id: input.workflowRunId,
      org_id: input.orgId,
      output_type: input.outputType,
      draft_content: input.draftContent,
      structured_content: input.structuredContent,
      status: "draft",
    })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create output: ${error.message}`);
  return data;
}

export async function getOutput(
  supabase: SupabaseClient<Database>,
  orgId: string,
  outputId: string
): Promise<Output | null> {
  const { data, error } = await supabase
    .from("outputs")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", outputId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load output: ${error.message}`);
  return data;
}

export async function updateOutputAfterReview(
  supabase: SupabaseClient<Database>,
  orgId: string,
  outputId: string,
  input: {
    status: OutputStatus;
    draftContent: string;
    /** Pass when the reviewer edited the subject too, to keep it in sync. */
    structuredContent?: Record<string, unknown>;
  }
): Promise<Output> {
  const { data, error } = await supabase
    .from("outputs")
    .update({
      status: input.status,
      draft_content: input.draftContent,
      ...(input.structuredContent ? { structured_content: input.structuredContent } : {}),
    })
    .eq("org_id", orgId)
    .eq("id", outputId)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to update output: ${error.message}`);
  return data;
}

export async function createApproval(
  supabase: SupabaseClient<Database>,
  input: {
    outputId: string;
    approverId: string;
    status: ApprovalStatus;
    editedContent?: string | null;
  }
): Promise<Approval> {
  const { data, error } = await supabase
    .from("approvals")
    .insert({
      output_id: input.outputId,
      approver_id: input.approverId,
      status: input.status,
      edited_content: input.editedContent ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create approval: ${error.message}`);
  return data;
}

export async function getApprovalForOutput(
  supabase: SupabaseClient<Database>,
  outputId: string
): Promise<Approval | null> {
  const { data, error } = await supabase
    .from("approvals")
    .select("*")
    .eq("output_id", outputId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load approval: ${error.message}`);
  return data;
}

export type HumanValueEntryWrite = {
  contextAdded: string;
  judgmentApplied: string;
  preferenceConsidered: string;
  riskIdentified: string;
  recommendationMade: string;
  correctionsMade: string;
};

export async function createHumanValueEntry(
  supabase: SupabaseClient<Database>,
  orgId: string,
  outputId: string,
  createdBy: string,
  input: HumanValueEntryWrite
): Promise<HumanValueEntry> {
  const { data, error } = await supabase
    .from("human_value_entries")
    .insert({
      output_id: outputId,
      org_id: orgId,
      created_by: createdBy,
      context_added: input.contextAdded || null,
      judgment_applied: input.judgmentApplied || null,
      preference_considered: input.preferenceConsidered || null,
      risk_identified: input.riskIdentified || null,
      recommendation_made: input.recommendationMade || null,
      corrections_made: input.correctionsMade || null,
    })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create human value entry: ${error.message}`);
  return data;
}

export async function getHumanValueEntryForOutput(
  supabase: SupabaseClient<Database>,
  outputId: string
): Promise<HumanValueEntry | null> {
  const { data, error } = await supabase
    .from("human_value_entries")
    .select("*")
    .eq("output_id", outputId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load human value entry: ${error.message}`);
  return data;
}
