import { z } from "zod";

export const PIPELINE_STAGES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "customer",
  "dormant",
] as const;

export const PIPELINE_STAGE_LABELS: Record<(typeof PIPELINE_STAGES)[number], string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  customer: "Customer",
  dormant: "Dormant",
};

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Contact name is required").max(160),
  company: z.string().trim().max(160).default(""),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .default("")
    .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address"),
  phone: z.string().trim().max(40).default(""),
  source: z.string().trim().max(160).default(""),
  notes: z.string().trim().max(4000).default(""),
  pipelineStage: z.enum(PIPELINE_STAGES).default("new"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const updatePipelineStageSchema = z.object({
  pipelineStage: z.enum(PIPELINE_STAGES),
});
