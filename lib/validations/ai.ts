import { z } from "zod";

export const draftPromptFormSchema = z.object({
  userPrompt: z.string().trim().min(1, "Tell us what this email needs to say").max(4000),
});

export type DraftGenerationState = { error?: string };

export const ENTITLEMENT_BLOCKED_MESSAGE =
  "You've used all your AI drafts for this month. It resets at the start of next month.";

export const outputReviewFormSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(200),
  // The HTML form-submission spec normalizes <textarea> line breaks to
  // \r\n when serialized, so an entirely untouched body would still arrive
  // with different line endings than the model's JSON (\n-only) response —
  // normalize before validating, or every unedited approval falsely reads
  // as edited. Caught live (see app/[orgSlug]/outputs/actions.ts).
  body: z
    .string()
    .transform((val) => val.replace(/\r\n/g, "\n").trim())
    .pipe(z.string().min(1, "Body is required").max(8000)),
});

export type ReviewFormState = { error?: string; success?: boolean };

export const humanValueEntryFormSchema = z.object({
  contextAdded: z.string().trim().max(2000).default(""),
  judgmentApplied: z.string().trim().max(2000).default(""),
  preferenceConsidered: z.string().trim().max(2000).default(""),
  riskIdentified: z.string().trim().max(2000).default(""),
  recommendationMade: z.string().trim().max(2000).default(""),
  correctionsMade: z.string().trim().max(2000).default(""),
});

export type HumanValueFormState = { error?: string; success?: boolean };
