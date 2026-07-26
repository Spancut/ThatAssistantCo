import type { AssembledContext } from "@/lib/ai/types";

/**
 * Bump this whenever the prompt text changes in a way that could affect
 * output quality/shape. Stored on every workflow_run so a bad output can be
 * traced back to exactly what prompt produced it.
 */
export const DRAFT_EMAIL_PROMPT_VERSION = "draft-email-v1";

function formatKnowledgeItems(items: AssembledContext["knowledgeItems"]): string {
  if (items.length === 0) return "(none on file)";
  return items
    .map((item) => `- ${item.title}${item.tags.length ? ` [${item.tags.join(", ")}]` : ""}: ${item.content}`)
    .join("\n");
}

function formatJsonNotes(value: Record<string, unknown>): string {
  const notes = value?.notes;
  if (typeof notes === "string" && notes.trim()) return notes.trim();
  const keys = Object.keys(value ?? {});
  return keys.length > 0 ? JSON.stringify(value) : "(none on file)";
}

/**
 * One shared prompt for both products — Partner and Founder differ only in
 * which context fields exist (lib/ai/context.ts), not in a separate prompt
 * or a separate model call. Safety-policy guidance is embedded directly
 * here (single call, no separate moderation step) per
 * docs/ai-orchestration.md.
 */
export function buildDraftEmailPrompt(context: AssembledContext, userPrompt: string): string {
  const recipientBlock =
    context.sourceType === "client"
      ? [
          `Recipient: ${context.sourceName} (an existing client of ours)`,
          `Brand voice for this client: ${context.brandVoice?.trim() || "(none on file — use a clear, professional, friendly default)"}`,
          `Preferences: ${formatJsonNotes(context.preferences)}`,
          `Key facts about this client: ${formatJsonNotes(context.keyFacts)}`,
        ].join("\n")
      : [
          `Recipient: ${context.sourceName} (a lead/contact, currently at pipeline stage "${context.pipelineStage}")`,
          `Notes on file about this contact: ${context.notes?.trim() || "(none on file)"}`,
        ].join("\n");

  return `You are drafting a business email on behalf of the user. You are NOT sending it — you are producing a draft for the user to review, edit, and send themselves.

${recipientBlock}

Related knowledge on file:
${formatKnowledgeItems(context.knowledgeItems)}

What the user asked for:
${userPrompt.trim()}

Instructions:
- Write a complete, ready-to-review email: a subject line and a body.
- Match the recipient's brand voice/preferences where provided. If none are on file, default to clear, professional, and friendly.
- Only use facts provided above or in the user's request. Do not invent client history, commitments, prices, dates, or outcomes that weren't given to you.
- Never include earnings claims, health claims, legal claims, financial guarantees, invented testimonials, impersonation of a real person, deceptive urgency, or unsupported guarantees. If the request asks for any of these, write the email without that claim and lower your confidence_flag accordingly, explaining the omission in tone_notes.
- List in context_sources_used which of the provided context items (brand voice, preferences, key facts, notes, specific knowledge item titles) you actually drew on. If you used none beyond the user's request, return an empty array.
- Set confidence_flag to "low" if you had to guess at tone or facts, "medium" if partially grounded, "high" if fully grounded in the provided context and request.
- tone_notes should briefly explain your tone choices and any assumptions made, for the human reviewer.`;
}
