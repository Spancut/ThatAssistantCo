import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2, "Workspace name must be at least 2 characters").max(80),
  productMode: z.enum(["partner", "founder"], "Choose Partner or Founder"),
});

export const renameWorkspaceSchema = z.object({
  name: z.string().trim().min(2, "Workspace name must be at least 2 characters").max(80),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type RenameWorkspaceInput = z.infer<typeof renameWorkspaceSchema>;
