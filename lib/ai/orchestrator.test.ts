import { describe, expect, it, vi } from "vitest";
import { FakeSupabase } from "@/test/helpers/fake-supabase";
import { generateDraftEmail } from "./orchestrator";
import { ModelOutputValidationError, type ModelClient } from "./client";
import type { AssembledContext } from "./types";

const ORG_A = "org-a";
const USER_A = "user-a";

const CONTEXT: AssembledContext = {
  sourceType: "client",
  sourceId: "client-1",
  sourceName: "Acme Co",
  brandVoice: "Friendly and direct",
  preferences: {},
  keyFacts: {},
  knowledgeItems: [],
};

function seedTemplate(fake: FakeSupabase) {
  fake.seed("workflow_templates", [
    {
      id: "tmpl-1",
      key: "draft_email",
      product_mode: "both",
      input_schema: {},
      prompt_version: "draft-email-v1",
      output_schema_key: "draft_email_output",
      requires_approval: true,
      created_at: new Date().toISOString(),
    },
  ]);
}

function fakeModelClient(
  impl: (schema: unknown, prompt: string, schemaName: string) => Promise<unknown>
): ModelClient {
  return {
    generateStructured: vi.fn(impl) as unknown as ModelClient["generateStructured"],
  };
}

describe("generateDraftEmail — entitlement gate", () => {
  it("blocks generation and never calls the model when usage is exhausted", async () => {
    const fake = new FakeSupabase();
    seedTemplate(fake);
    fake.seed("entitlements", [
      { org_id: ORG_A, feature_key: "ai_generations_per_month", limit_value: 5 },
    ]);
    fake.seed("usage_events", [
      {
        org_id: ORG_A,
        feature_key: "ai_generations_per_month",
        amount: 5,
        created_at: new Date().toISOString(),
      },
    ]);

    const modelClient = fakeModelClient(async () => {
      throw new Error("should never be called");
    });

    const result = await generateDraftEmail(
      fake.asClient(),
      { orgId: ORG_A, userId: USER_A, userPrompt: "Follow up about the proposal", context: CONTEXT },
      modelClient
    );

    expect(result).toEqual({ ok: false, reason: "entitlement_blocked", remaining: 0 });
    expect(modelClient.generateStructured).not.toHaveBeenCalled();
    // No run should even be initiated for a blocked attempt.
    expect(fake.rowsIn("workflow_runs")).toHaveLength(0);
    expect(fake.rowsIn("outputs")).toHaveLength(0);
  });
});

describe("generateDraftEmail — malformed model output", () => {
  it("marks the workflow_run failed and creates no output when validation fails twice", async () => {
    const fake = new FakeSupabase();
    seedTemplate(fake);
    fake.seed("entitlements", [
      { org_id: ORG_A, feature_key: "ai_generations_per_month", limit_value: null },
    ]);

    const modelClient = fakeModelClient(async () => {
      throw new ModelOutputValidationError("Model output failed schema validation twice in a row", []);
    });

    const result = await generateDraftEmail(
      fake.asClient(),
      { orgId: ORG_A, userId: USER_A, userPrompt: "Draft a reply", context: CONTEXT },
      modelClient
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("generation_failed");
    }

    const runs = fake.rowsIn("workflow_runs");
    expect(runs).toHaveLength(1);
    expect(runs[0].status).toBe("failed");

    // A failed run must never produce an output — no malformed content is
    // ever surfaced as if it were usable.
    expect(fake.rowsIn("outputs")).toHaveLength(0);
    // Usage is only recorded on a successful generation.
    expect(fake.rowsIn("usage_events")).toHaveLength(0);
  });
});

describe("generateDraftEmail — successful generation", () => {
  it("persists a draft output, completes the run, and records usage", async () => {
    const fake = new FakeSupabase();
    fake.setCurrentUser(USER_A);
    seedTemplate(fake);
    fake.seed("entitlements", [
      { org_id: ORG_A, feature_key: "ai_generations_per_month", limit_value: null },
    ]);

    const generated = {
      subject: "Following up on your proposal",
      body: "Hi there, just checking in on the proposal we sent last week.",
      tone_notes: "Friendly, brief.",
      context_sources_used: ["brand voice"],
      confidence_flag: "high" as const,
    };

    const modelClient = fakeModelClient(async () => ({
      data: generated,
      model: "gpt-4o-mini",
      usage: { inputTokens: 100, outputTokens: 40, totalTokens: 140 },
    }));

    const result = await generateDraftEmail(
      fake.asClient(),
      { orgId: ORG_A, userId: USER_A, userPrompt: "Follow up about the proposal", context: CONTEXT },
      modelClient
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.outputId).toBeTruthy();

    const runs = fake.rowsIn("workflow_runs");
    expect(runs).toHaveLength(1);
    expect(runs[0].status).toBe("completed");
    expect(runs[0].input_snapshot).toMatchObject({
      userPrompt: "Follow up about the proposal",
      context: CONTEXT,
    });

    const outputs = fake.rowsIn("outputs");
    expect(outputs).toHaveLength(1);
    expect(outputs[0].status).toBe("draft");
    expect(outputs[0].draft_content).toBe(generated.body);
    expect(outputs[0].structured_content).toMatchObject(generated);

    const usage = fake.rowsIn("usage_events");
    expect(usage).toHaveLength(1);
    expect(usage[0]).toMatchObject({
      org_id: ORG_A,
      feature_key: "ai_generations_per_month",
      amount: 1,
    });
  });
});
