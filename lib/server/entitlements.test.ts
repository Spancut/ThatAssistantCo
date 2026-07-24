import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { checkEntitlement, recordUsage } from "./entitlements";

type EntitlementRow = { org_id: string; feature_key: string; limit_value: number | null };
type UsageRow = { org_id: string; feature_key: string; amount: number; created_at: string };

/**
 * A minimal in-memory stand-in for the Supabase query builder, backed by
 * plain arrays, so recordUsage()'s insert is actually visible to a
 * subsequent checkEntitlement() read within the same test — a pure
 * vi.fn() mock can't express that interaction.
 */
class FakeSupabase {
  entitlements: EntitlementRow[] = [];
  usageEvents: UsageRow[] = [];
  userId = "user-1";

  auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> } = {
    getUser: async () => ({ data: { user: { id: this.userId } } }),
  };

  from(table: string) {
    if (table === "entitlements") return this.entitlementsQuery();
    if (table === "usage_events") return this.usageEventsQuery();
    throw new Error(`FakeSupabase: unexpected table "${table}"`);
  }

  asClient(): SupabaseClient<Database> {
    return this as unknown as SupabaseClient<Database>;
  }

  private entitlementsQuery() {
    const filters: Record<string, string> = {};
    const chain = {
      select: () => chain,
      eq: (col: string, val: string) => {
        filters[col] = val;
        return chain;
      },
      maybeSingle: async () => {
        const row = this.entitlements.find(
          (e) => e.org_id === filters.org_id && e.feature_key === filters.feature_key
        );
        return { data: row ? { limit_value: row.limit_value } : null, error: null };
      },
    };
    return chain;
  }

  private usageEventsQuery() {
    const filters: Record<string, string> = {};
    let minCreatedAt: string | undefined;
    const resolveRows = () =>
      this.usageEvents.filter(
        (e) =>
          e.org_id === filters.org_id &&
          e.feature_key === filters.feature_key &&
          (!minCreatedAt || e.created_at >= minCreatedAt)
      );

    const chain: {
      select: () => typeof chain;
      eq: (col: string, val: string) => typeof chain;
      gte: (col: string, val: string) => typeof chain;
      insert: (row: Record<string, unknown>) => Promise<{ error: null }>;
      then: (resolve: (value: { data: { amount: number }[]; error: null }) => void) => Promise<unknown>;
    } = {
      select: () => chain,
      eq: (col: string, val: string) => {
        filters[col] = val;
        return chain;
      },
      gte: (col: string, val: string) => {
        minCreatedAt = val;
        return chain;
      },
      insert: async (row: Record<string, unknown>) => {
        this.usageEvents.push({
          org_id: row.org_id as string,
          feature_key: row.feature_key as string,
          amount: row.amount as number,
          created_at: new Date().toISOString(),
        });
        return { error: null };
      },
      then: (resolve) =>
        Promise.resolve({ data: resolveRows().map((r) => ({ amount: r.amount })), error: null }).then(
          resolve
        ),
    };
    return chain;
  }
}

describe("checkEntitlement", () => {
  it("default-denies a feature with no entitlement row configured", async () => {
    const fake = new FakeSupabase();
    const result = await checkEntitlement("org-1", "unknown_feature", fake.asClient());
    expect(result).toEqual({ allowed: false, remaining: 0 });
  });

  it("allows when limit_value is null (unlimited), without needing any usage", async () => {
    const fake = new FakeSupabase();
    fake.entitlements.push({ org_id: "org-1", feature_key: "max_clients", limit_value: null });

    const result = await checkEntitlement("org-1", "max_clients", fake.asClient());
    expect(result).toEqual({ allowed: true, remaining: null });
  });

  it("allows when usage is below the limit", async () => {
    const fake = new FakeSupabase();
    fake.entitlements.push({
      org_id: "org-1",
      feature_key: "ai_generations_per_month",
      limit_value: 5,
    });
    fake.usageEvents.push({
      org_id: "org-1",
      feature_key: "ai_generations_per_month",
      amount: 3,
      created_at: new Date().toISOString(),
    });

    const result = await checkEntitlement("org-1", "ai_generations_per_month", fake.asClient());
    expect(result).toEqual({ allowed: true, remaining: 2 });
  });

  it("blocks when usage has reached the limit", async () => {
    const fake = new FakeSupabase();
    fake.entitlements.push({
      org_id: "org-1",
      feature_key: "ai_generations_per_month",
      limit_value: 5,
    });
    fake.usageEvents.push({
      org_id: "org-1",
      feature_key: "ai_generations_per_month",
      amount: 5,
      created_at: new Date().toISOString(),
    });

    const result = await checkEntitlement("org-1", "ai_generations_per_month", fake.asClient());
    expect(result).toEqual({ allowed: false, remaining: 0 });
  });

  it("blocks when usage exceeds the limit", async () => {
    const fake = new FakeSupabase();
    fake.entitlements.push({
      org_id: "org-1",
      feature_key: "ai_generations_per_month",
      limit_value: 5,
    });
    fake.usageEvents.push({
      org_id: "org-1",
      feature_key: "ai_generations_per_month",
      amount: 9,
      created_at: new Date().toISOString(),
    });

    const result = await checkEntitlement("org-1", "ai_generations_per_month", fake.asClient());
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});

describe("recordUsage", () => {
  it("writes a usage_events row attributed to the authenticated user", async () => {
    const fake = new FakeSupabase();
    fake.userId = "user-42";

    await recordUsage("org-1", "ai_generations_per_month", 1, fake.asClient());

    expect(fake.usageEvents).toHaveLength(1);
    expect(fake.usageEvents[0]).toMatchObject({
      org_id: "org-1",
      feature_key: "ai_generations_per_month",
      amount: 1,
    });
  });

  it("defaults amount to 1 when omitted", async () => {
    const fake = new FakeSupabase();
    await recordUsage("org-1", "ai_generations_per_month", undefined, fake.asClient());
    expect(fake.usageEvents[0].amount).toBe(1);
  });

  it("throws when there is no authenticated user", async () => {
    const fake = new FakeSupabase();
    fake.auth.getUser = async () => ({ data: { user: null } });

    await expect(recordUsage("org-1", "ai_generations_per_month", 1, fake.asClient())).rejects.toThrow(
      /no authenticated user/
    );
  });

  it("causes checkEntitlement to reflect the new usage on the next call", async () => {
    const fake = new FakeSupabase();
    fake.entitlements.push({
      org_id: "org-1",
      feature_key: "ai_generations_per_month",
      limit_value: 3,
    });

    const before = await checkEntitlement("org-1", "ai_generations_per_month", fake.asClient());
    expect(before).toEqual({ allowed: true, remaining: 3 });

    await recordUsage("org-1", "ai_generations_per_month", 1, fake.asClient());
    await recordUsage("org-1", "ai_generations_per_month", 1, fake.asClient());

    const after = await checkEntitlement("org-1", "ai_generations_per_month", fake.asClient());
    expect(after).toEqual({ allowed: true, remaining: 1 });

    await recordUsage("org-1", "ai_generations_per_month", 1, fake.asClient());
    const exhausted = await checkEntitlement("org-1", "ai_generations_per_month", fake.asClient());
    expect(exhausted).toEqual({ allowed: false, remaining: 0 });
  });
});

describe("checkEntitlement error handling", () => {
  it("surfaces the underlying error instead of failing silently", async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: { message: "connection lost" } }),
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient<Database>;

    await expect(checkEntitlement("org-1", "max_clients", client)).rejects.toThrow(/connection lost/);
  });
});
