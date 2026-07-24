import { describe, expect, it } from "vitest";
import { FakeSupabase } from "@/test/helpers/fake-supabase";
import {
  archiveClientProfile,
  countActiveClientProfiles,
  createClientProfile,
  getClientProfile,
  listClientProfiles,
  updateClientProfile,
} from "./clients";
import { countContacts, createContact, getContact, listContacts } from "./contacts";
import {
  createKnowledgeItem,
  listKnowledgeItemsForClient,
  listKnowledgeItemsForContact,
} from "./knowledge";

const ORG_A = "org-a";
const ORG_B = "org-b";
const USER_A = "user-a";

describe("client_profiles org-scoping", () => {
  it("listClientProfiles never returns another org's clients", async () => {
    const fake = new FakeSupabase().seed("client_profiles", [
      { id: "c1", org_id: ORG_A, name: "Acme", archived_at: null },
      { id: "c2", org_id: ORG_B, name: "Globex", archived_at: null },
    ]);

    const result = await listClientProfiles(fake.asClient(), ORG_A);

    expect(result.map((c) => c.id)).toEqual(["c1"]);
  });

  it("excludes archived clients by default but includes them on request", async () => {
    const fake = new FakeSupabase().seed("client_profiles", [
      { id: "c1", org_id: ORG_A, name: "Acme", archived_at: null },
      { id: "c2", org_id: ORG_A, name: "Old Co", archived_at: "2026-01-01T00:00:00.000Z" },
    ]);

    const active = await listClientProfiles(fake.asClient(), ORG_A);
    expect(active.map((c) => c.id)).toEqual(["c1"]);

    const all = await listClientProfiles(fake.asClient(), ORG_A, { includeArchived: true });
    expect(all.map((c) => c.id).sort()).toEqual(["c1", "c2"]);
  });

  it("countActiveClientProfiles only counts the given org's active clients", async () => {
    const fake = new FakeSupabase().seed("client_profiles", [
      { id: "c1", org_id: ORG_A, archived_at: null },
      { id: "c2", org_id: ORG_A, archived_at: "2026-01-01T00:00:00.000Z" },
      { id: "c3", org_id: ORG_B, archived_at: null },
    ]);

    await expect(countActiveClientProfiles(fake.asClient(), ORG_A)).resolves.toBe(1);
    await expect(countActiveClientProfiles(fake.asClient(), ORG_B)).resolves.toBe(1);
  });

  it("getClientProfile returns null for a client that belongs to a different org", async () => {
    const fake = new FakeSupabase().seed("client_profiles", [
      { id: "c1", org_id: ORG_B, name: "Globex", archived_at: null },
    ]);

    const result = await getClientProfile(fake.asClient(), ORG_A, "c1");
    expect(result).toBeNull();
  });

  it("createClientProfile attributes the new row to the given org", async () => {
    const fake = new FakeSupabase();

    const created = await createClientProfile(fake.asClient(), ORG_A, USER_A, {
      name: "New Client",
      brandVoice: "",
      preferences: {},
      keyFacts: {},
    });

    expect(created.org_id).toBe(ORG_A);
    expect(fake.rowsIn("client_profiles")).toHaveLength(1);
  });

  it("updateClientProfile cannot modify a client in a different org", async () => {
    const fake = new FakeSupabase().seed("client_profiles", [
      { id: "c1", org_id: ORG_B, name: "Globex", brand_voice: null, preferences: {}, key_facts: {} },
    ]);

    // The fake has no RLS, so this proves the *application query* itself is
    // scoped: asking to update org A's view of client c1 (which actually
    // belongs to org B) matches zero rows. Real PostgREST's .single()
    // errors on zero rows, so this throws rather than silently no-op'ing.
    await expect(
      updateClientProfile(fake.asClient(), ORG_A, "c1", {
        name: "Hijacked",
        brandVoice: "",
        preferences: {},
        keyFacts: {},
      })
    ).rejects.toThrow();

    expect(fake.rowsIn("client_profiles")[0].name).toBe("Globex");
  });

  it("archiveClientProfile cannot archive a client in a different org", async () => {
    const fake = new FakeSupabase().seed("client_profiles", [
      { id: "c1", org_id: ORG_B, archived_at: null },
    ]);

    await expect(archiveClientProfile(fake.asClient(), ORG_A, "c1")).rejects.toThrow();

    expect(fake.rowsIn("client_profiles")[0].archived_at).toBeNull();
  });
});

describe("contacts org-scoping", () => {
  it("listContacts never returns another org's contacts", async () => {
    const fake = new FakeSupabase().seed("contacts", [
      { id: "k1", org_id: ORG_A, name: "Ada", created_at: "2026-01-01" },
      { id: "k2", org_id: ORG_B, name: "Bea", created_at: "2026-01-02" },
    ]);

    const result = await listContacts(fake.asClient(), ORG_A);
    expect(result.map((c) => c.id)).toEqual(["k1"]);
  });

  it("countContacts only counts the given org's contacts", async () => {
    const fake = new FakeSupabase().seed("contacts", [
      { id: "k1", org_id: ORG_A },
      { id: "k2", org_id: ORG_A },
      { id: "k3", org_id: ORG_B },
    ]);

    await expect(countContacts(fake.asClient(), ORG_A)).resolves.toBe(2);
    await expect(countContacts(fake.asClient(), ORG_B)).resolves.toBe(1);
  });

  it("getContact returns null for a contact that belongs to a different org", async () => {
    const fake = new FakeSupabase().seed("contacts", [{ id: "k1", org_id: ORG_B, name: "Bea" }]);

    const result = await getContact(fake.asClient(), ORG_A, "k1");
    expect(result).toBeNull();
  });

  it("createContact attributes the new row to the given org", async () => {
    const fake = new FakeSupabase();

    const created = await createContact(fake.asClient(), ORG_A, USER_A, {
      name: "New Lead",
      company: "",
      email: "",
      phone: "",
      source: "",
      notes: "",
      pipelineStage: "new",
    });

    expect(created.org_id).toBe(ORG_A);
  });
});

describe("knowledge_base_items org-scoping", () => {
  it("listKnowledgeItemsForClient excludes items from another org even with the same client id", async () => {
    const fake = new FakeSupabase().seed("knowledge_base_items", [
      { id: "i1", org_id: ORG_A, linked_client_profile_id: "c1", linked_contact_id: null },
      { id: "i2", org_id: ORG_B, linked_client_profile_id: "c1", linked_contact_id: null },
    ]);

    const result = await listKnowledgeItemsForClient(fake.asClient(), ORG_A, "c1");
    expect(result.map((i) => i.id)).toEqual(["i1"]);
  });

  it("listKnowledgeItemsForContact only returns items linked to that specific contact", async () => {
    const fake = new FakeSupabase().seed("knowledge_base_items", [
      { id: "i1", org_id: ORG_A, linked_client_profile_id: null, linked_contact_id: "k1" },
      { id: "i2", org_id: ORG_A, linked_client_profile_id: null, linked_contact_id: "k2" },
    ]);

    const result = await listKnowledgeItemsForContact(fake.asClient(), ORG_A, "k1");
    expect(result.map((i) => i.id)).toEqual(["i1"]);
  });

  it("createKnowledgeItem attributes the new row to the given org", async () => {
    const fake = new FakeSupabase();

    const created = await createKnowledgeItem(fake.asClient(), ORG_A, USER_A, {
      title: "Note",
      content: "",
      tags: [],
      linkedClientProfileId: "c1",
    });

    expect(created.org_id).toBe(ORG_A);
  });
});
