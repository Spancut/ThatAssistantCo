import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";

/**
 * This file is the ONLY place that calls the model — no route, action, or
 * component ever imports the `openai` package directly. See
 * docs/ai-orchestration.md.
 */
const MODEL = "gpt-4o-mini";

export class ModelOutputValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: unknown
  ) {
    super(message);
    this.name = "ModelOutputValidationError";
  }
}

export type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type GeneratedResult<T> = {
  data: T;
  model: string;
  usage: TokenUsage;
};

/** Swappable so orchestration code and tests never depend on the real SDK. */
export interface ModelClient {
  generateStructured<T>(
    schema: z.ZodType<T>,
    prompt: string,
    schemaName: string
  ): Promise<GeneratedResult<T>>;
}

/**
 * Retry-then-validate: calls `callModel` once, validates the result against
 * `schema`; on a validation failure calls it again; if the second attempt
 * also fails validation, throws ModelOutputValidationError instead of ever
 * returning malformed data. A network/API-level error from `callModel`
 * itself is NOT retried here — only schema-validation failures are, per
 * spec — it propagates immediately so the caller can fail fast.
 *
 * Provider-agnostic and exported so this logic is unit-testable without
 * mocking the OpenAI SDK.
 */
export async function generateWithValidation<T>(
  schema: z.ZodType<T>,
  callModel: () => Promise<{ parsedCandidate: unknown; model: string; usage: TokenUsage }>
): Promise<GeneratedResult<T>> {
  let lastIssues: unknown;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const { parsedCandidate, model, usage } = await callModel();
    const result = schema.safeParse(parsedCandidate);
    if (result.success) {
      return { data: result.data, model, usage };
    }
    lastIssues = result.error.issues;
  }

  throw new ModelOutputValidationError(
    "Model output failed schema validation twice in a row",
    lastIssues
  );
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey });
}

export function createOpenAIModelClient(): ModelClient {
  return {
    async generateStructured<T>(schema: z.ZodType<T>, prompt: string, schemaName: string) {
      const openai = getOpenAIClient();

      return generateWithValidation(schema, async () => {
        const response = await openai.responses.parse({
          model: MODEL,
          input: prompt,
          text: { format: zodTextFormat(schema, schemaName) },
        });

        return {
          parsedCandidate: response.output_parsed,
          model: response.model,
          usage: {
            inputTokens: response.usage?.input_tokens ?? 0,
            outputTokens: response.usage?.output_tokens ?? 0,
            totalTokens: response.usage?.total_tokens ?? 0,
          },
        };
      });
    },
  };
}
