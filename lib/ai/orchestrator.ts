import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { checkEntitlement, recordUsage } from "@/lib/server/entitlements";
import {
  createOutput,
  createWorkflowRun,
  getWorkflowTemplateByKey,
  updateWorkflowRunStatus,
} from "@/lib/server/ai-workflows";
import { draftEmailOutputSchema, OUTPUT_SCHEMA_KEY } from "./schema";
import { buildDraftEmailPrompt } from "./prompts/draft-email";
import { createOpenAIModelClient, ModelOutputValidationError, type ModelClient } from "./client";
import type { AssembledContext } from "./types";

const FEATURE_KEY = "ai_generations_per_month";
const WORKFLOW_KEY = "draft_email";

export type GenerateDraftEmailResult =
  | { ok: true; outputId: string }
  | { ok: false; reason: "entitlement_blocked"; remaining: number | null }
  | { ok: false; reason: "generation_failed"; error: string };

/**
 * The single orchestration path for the draft_email workflow, shared by
 * both products — Partner and Founder call this with a different
 * AssembledContext (lib/ai/context.ts) but identical downstream logic:
 * entitlement gate -> workflow_run -> model call+validate -> persist
 * output (status "draft") -> record usage.
 *
 * `modelClient` defaults to the real OpenAI-backed client; tests inject a
 * fake one and never touch the network or lib/server/entitlements' own
 * network calls need a FakeSupabase passed as `supabase`.
 */
export async function generateDraftEmail(
  supabase: SupabaseClient<Database>,
  params: {
    orgId: string;
    userId: string;
    userPrompt: string;
    context: AssembledContext;
  },
  modelClient: ModelClient = createOpenAIModelClient()
): Promise<GenerateDraftEmailResult> {
  const entitlement = await checkEntitlement(params.orgId, FEATURE_KEY, supabase);
  if (!entitlement.allowed) {
    return { ok: false, reason: "entitlement_blocked", remaining: entitlement.remaining };
  }

  const template = await getWorkflowTemplateByKey(supabase, WORKFLOW_KEY);
  if (!template) {
    return {
      ok: false,
      reason: "generation_failed",
      error: `Workflow template "${WORKFLOW_KEY}" is not configured`,
    };
  }

  const run = await createWorkflowRun(supabase, {
    workflowTemplateId: template.id,
    orgId: params.orgId,
    initiatedBy: params.userId,
    inputSnapshot: { userPrompt: params.userPrompt, context: params.context },
  });

  const prompt = buildDraftEmailPrompt(params.context, params.userPrompt);

  let generated;
  try {
    generated = await modelClient.generateStructured(
      draftEmailOutputSchema,
      prompt,
      OUTPUT_SCHEMA_KEY
    );
  } catch (err) {
    await updateWorkflowRunStatus(supabase, params.orgId, run.id, "failed");
    const message =
      err instanceof ModelOutputValidationError
        ? "The AI response didn't match the expected format, even after a retry."
        : err instanceof Error
          ? err.message
          : "Unknown error generating the draft.";
    return { ok: false, reason: "generation_failed", error: message };
  }

  const output = await createOutput(supabase, {
    workflowRunId: run.id,
    orgId: params.orgId,
    outputType: WORKFLOW_KEY,
    draftContent: generated.data.body,
    structuredContent: { ...generated.data },
  });

  await updateWorkflowRunStatus(supabase, params.orgId, run.id, "completed");
  await recordUsage(params.orgId, FEATURE_KEY, 1, supabase);

  return { ok: true, outputId: output.id };
}
