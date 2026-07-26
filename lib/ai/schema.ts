import { z } from "zod";

/**
 * The output contract for the "draft_email" workflow, defined before the
 * prompt was written (docs/ai-orchestration.md). Every model response is
 * validated against this — see lib/ai/client.ts. If validation fails twice
 * (original + one retry), the workflow_run ends in status "failed" and no
 * output is ever persisted or shown as usable.
 */
export const draftEmailOutputSchema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(8000),
  tone_notes: z.string().max(2000),
  context_sources_used: z.array(z.string()).max(50),
  confidence_flag: z.enum(["high", "medium", "low"]),
});

export type DraftEmailOutput = z.infer<typeof draftEmailOutputSchema>;

export const OUTPUT_SCHEMA_KEY = "draft_email_output";
