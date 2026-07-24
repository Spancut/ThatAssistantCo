import { describe, expect, it } from "vitest";
import { createWorkspaceSchema, renameWorkspaceSchema } from "./workspace";

describe("createWorkspaceSchema", () => {
  it("accepts a valid partner workspace", () => {
    const result = createWorkspaceSchema.safeParse({
      name: "Acme Consulting",
      productMode: "partner",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid founder workspace", () => {
    const result = createWorkspaceSchema.safeParse({
      name: "Acme Retail",
      productMode: "founder",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a name that is too short", () => {
    const result = createWorkspaceSchema.safeParse({ name: "A", productMode: "partner" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown product mode", () => {
    const result = createWorkspaceSchema.safeParse({
      name: "Acme Consulting",
      productMode: "enterprise",
    });
    expect(result.success).toBe(false);
  });

  it("trims the workspace name", () => {
    const result = createWorkspaceSchema.safeParse({
      name: "  Acme Consulting  ",
      productMode: "partner",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Acme Consulting");
    }
  });
});

describe("renameWorkspaceSchema", () => {
  it("accepts a valid name", () => {
    expect(renameWorkspaceSchema.safeParse({ name: "New Name" }).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(renameWorkspaceSchema.safeParse({ name: "" }).success).toBe(false);
  });
});
