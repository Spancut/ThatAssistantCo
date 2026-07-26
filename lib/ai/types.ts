/**
 * Shared types for the AI orchestration module. Kept separate from
 * context.ts/client.ts/orchestrator.ts to avoid import cycles between them.
 */

export type KnowledgeItemContext = {
  title: string;
  content: string;
  tags: string[];
};

/**
 * What context assembly actually produces — this is the part that differs
 * between Partner and Founder (lib/ai/context.ts). Everything downstream
 * (prompt building, the model call, persistence) is shared and doesn't
 * care which branch of this union it got.
 */
export type AssembledContext =
  | {
      sourceType: "client";
      sourceId: string;
      sourceName: string;
      brandVoice: string | null;
      preferences: Record<string, unknown>;
      keyFacts: Record<string, unknown>;
      knowledgeItems: KnowledgeItemContext[];
    }
  | {
      sourceType: "contact";
      sourceId: string;
      sourceName: string;
      notes: string | null;
      pipelineStage: string;
      knowledgeItems: KnowledgeItemContext[];
    };
