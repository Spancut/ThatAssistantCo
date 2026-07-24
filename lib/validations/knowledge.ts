import { z } from "zod";

export const knowledgeItemFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().trim().max(8000).default(""),
  tags: z.string().trim().max(300).default(""),
});

export type KnowledgeItemFormInput = z.infer<typeof knowledgeItemFormSchema>;
export type KnowledgeItemFormState = { error?: string };

/** "tag one, tag two" -> ["tag one", "tag two"], deduped, empty entries dropped. */
export function parseTagsInput(raw: string): string[] {
  const seen = new Set<string>();
  for (const tag of raw.split(",")) {
    const trimmed = tag.trim();
    if (trimmed) seen.add(trimmed);
  }
  return [...seen];
}
