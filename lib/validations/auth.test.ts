import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema } from "./auth";

describe("signUpSchema", () => {
  it("accepts valid input and normalizes email", () => {
    const result = signUpSchema.safeParse({
      fullName: "  Ada Lovelace  ",
      email: "  ADA@Example.com ",
      password: "supersecret",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ada@example.com");
      expect(result.data.fullName).toBe("Ada Lovelace");
    }
  });

  it("rejects a short password", () => {
    const result = signUpSchema.safeParse({
      fullName: "Ada",
      email: "ada@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = signUpSchema.safeParse({
      fullName: "Ada",
      email: "not-an-email",
      password: "supersecret",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = signUpSchema.safeParse({
      fullName: "   ",
      email: "ada@example.com",
      password: "supersecret",
    });
    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("accepts valid input", () => {
    const result = signInSchema.safeParse({ email: "ada@example.com", password: "x" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing password", () => {
    const result = signInSchema.safeParse({ email: "ada@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});
