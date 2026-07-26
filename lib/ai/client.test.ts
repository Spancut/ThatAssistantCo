import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ModelOutputValidationError, generateWithValidation } from "./client";

const schema = z.object({ subject: z.string(), body: z.string() });

describe("generateWithValidation", () => {
  it("returns the parsed data on a valid first attempt without retrying", async () => {
    const callModel = vi.fn().mockResolvedValue({
      parsedCandidate: { subject: "Hi", body: "Hello there" },
      model: "gpt-4o-mini",
      usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
    });

    const result = await generateWithValidation(schema, callModel);

    expect(result.data).toEqual({ subject: "Hi", body: "Hello there" });
    expect(callModel).toHaveBeenCalledTimes(1);
  });

  it("retries once when the first response fails schema validation, then succeeds", async () => {
    const callModel = vi
      .fn()
      .mockResolvedValueOnce({
        parsedCandidate: { subject: "Hi" }, // missing "body" -> invalid
        model: "gpt-4o-mini",
        usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
      })
      .mockResolvedValueOnce({
        parsedCandidate: { subject: "Hi", body: "Hello there" },
        model: "gpt-4o-mini",
        usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
      });

    const result = await generateWithValidation(schema, callModel);

    expect(result.data).toEqual({ subject: "Hi", body: "Hello there" });
    expect(callModel).toHaveBeenCalledTimes(2);
  });

  it("rejects a malformed response that fails validation twice in a row, without a third attempt", async () => {
    const callModel = vi.fn().mockResolvedValue({
      parsedCandidate: { subject: "Hi" }, // missing "body" every time
      model: "gpt-4o-mini",
      usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
    });

    await expect(generateWithValidation(schema, callModel)).rejects.toThrow(
      ModelOutputValidationError
    );
    expect(callModel).toHaveBeenCalledTimes(2);
  });

  it("does not retry a network/API-level error from callModel itself", async () => {
    const callModel = vi.fn().mockRejectedValue(new Error("OpenAI API unreachable"));

    await expect(generateWithValidation(schema, callModel)).rejects.toThrow(
      "OpenAI API unreachable"
    );
    expect(callModel).toHaveBeenCalledTimes(1);
  });
});
