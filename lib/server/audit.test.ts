import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { recordAuditEvent } from "./audit";

function makeMockClient(insertResult: { error: { message: string } | null }) {
  const insert = vi.fn().mockResolvedValue(insertResult);
  const from = vi.fn().mockReturnValue({ insert });
  return { client: { from } as unknown as SupabaseClient<Database>, insert, from };
}

describe("recordAuditEvent", () => {
  it("inserts a row with the expected shape", async () => {
    const { client, insert, from } = makeMockClient({ error: null });

    await recordAuditEvent(client, {
      orgId: "org-1",
      actorUserId: "user-1",
      action: "workspace.created",
      targetType: "organization",
      targetId: "org-1",
      metadata: { foo: "bar" },
    });

    expect(from).toHaveBeenCalledWith("audit_events");
    expect(insert).toHaveBeenCalledWith({
      org_id: "org-1",
      actor_user_id: "user-1",
      action: "workspace.created",
      target_type: "organization",
      target_id: "org-1",
      metadata: { foo: "bar" },
    });
  });

  it("defaults target_id and metadata when omitted", async () => {
    const { client, insert } = makeMockClient({ error: null });

    await recordAuditEvent(client, {
      orgId: "org-1",
      actorUserId: "user-1",
      action: "workspace.renamed",
      targetType: "organization",
    });

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ target_id: null, metadata: {} }));
  });

  it("throws when the insert fails", async () => {
    const { client } = makeMockClient({ error: { message: "boom" } });

    await expect(
      recordAuditEvent(client, {
        orgId: "org-1",
        actorUserId: "user-1",
        action: "workspace.created",
        targetType: "organization",
      })
    ).rejects.toThrow(/boom/);
  });

  it("rejects a missing required field before calling supabase", async () => {
    const { client, from } = makeMockClient({ error: null });

    await expect(
      recordAuditEvent(client, {
        orgId: "",
        actorUserId: "user-1",
        action: "workspace.created",
        targetType: "organization",
      })
    ).rejects.toThrow(/required/);

    expect(from).not.toHaveBeenCalled();
  });
});
