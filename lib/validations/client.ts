import { z } from "zod";

export const clientProfileFormSchema = z.object({
  name: z.string().trim().min(1, "Client name is required").max(160),
  brandVoice: z.string().trim().max(4000).default(""),
  preferencesNotes: z.string().trim().max(4000).default(""),
  keyFactsNotes: z.string().trim().max(4000).default(""),
});

export type ClientProfileFormInput = z.infer<typeof clientProfileFormSchema>;
