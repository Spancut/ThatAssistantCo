import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

export type EntitlementCheck = {
  allowed: boolean;
  /** null means unlimited. 0 (with allowed:false) means blocked. */
  remaining: number | null;
};

export type FeatureUsageSummary = {
  featureKey: string;
  limit: number | null;
  used: number;
  remaining: number | null;
};

export type BillingSummary = {
  plan: Database["public"]["Enums"]["subscription_plan"];
  status: Database["public"]["Enums"]["subscription_status"];
  features: FeatureUsageSummary[];
};

function startOfCurrentPeriodUtc(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

async function getUsageForCurrentPeriod(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  featureKey: string
): Promise<number> {
  const { data, error } = await supabase
    .from("usage_events")
    .select("amount")
    .eq("org_id", workspaceId)
    .eq("feature_key", featureKey)
    .gte("created_at", startOfCurrentPeriodUtc());

  if (error) {
    throw new Error(`Failed to load usage for "${featureKey}": ${error.message}`);
  }

  return (data ?? []).reduce((sum, row) => sum + row.amount, 0);
}

/**
 * Checks whether the workspace is entitled to consume one more unit of
 * `featureKey` this period. This is the ONLY supported way to answer that
 * question — no workflow or route should query entitlements/usage_events
 * directly.
 *
 * A feature with no entitlements row is default-denied, not
 * default-allowed: an unconfigured feature key is a bug to fix (add the
 * entitlement), not silent unlimited access.
 *
 * `client` is an optional override for tests/scripts that already hold a
 * Supabase client; production call sites can omit it and just pass
 * (workspaceId, featureKey).
 */
export async function checkEntitlement(
  workspaceId: string,
  featureKey: string,
  client?: SupabaseClient<Database>
): Promise<EntitlementCheck> {
  const supabase = client ?? (await createClient());

  const { data: entitlement, error } = await supabase
    .from("entitlements")
    .select("limit_value")
    .eq("org_id", workspaceId)
    .eq("feature_key", featureKey)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load entitlement "${featureKey}": ${error.message}`);
  }

  if (!entitlement) {
    return { allowed: false, remaining: 0 };
  }

  if (entitlement.limit_value === null) {
    return { allowed: true, remaining: null };
  }

  const used = await getUsageForCurrentPeriod(supabase, workspaceId, featureKey);
  const remaining = entitlement.limit_value - used;

  return { allowed: remaining > 0, remaining: Math.max(remaining, 0) };
}

/**
 * Records one unit (or `amount`) of usage against `featureKey`, attributed
 * to the caller's own authenticated session. This is the ONLY supported way
 * to record usage.
 */
export async function recordUsage(
  workspaceId: string,
  featureKey: string,
  amount = 1,
  client?: SupabaseClient<Database>
): Promise<void> {
  const supabase = client ?? (await createClient());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("recordUsage: no authenticated user");
  }

  const { error } = await supabase.from("usage_events").insert({
    org_id: workspaceId,
    feature_key: featureKey,
    amount,
    created_by: user.id,
  });

  if (error) {
    throw new Error(`Failed to record usage for "${featureKey}": ${error.message}`);
  }
}

/** Read-only billing summary for the /settings/billing page. */
export async function getBillingSummary(
  supabase: SupabaseClient<Database>,
  workspaceId: string
): Promise<BillingSummary | null> {
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("org_id", workspaceId)
    .maybeSingle();

  if (subscriptionError) {
    throw new Error(`Failed to load subscription: ${subscriptionError.message}`);
  }
  if (!subscription) return null;

  const { data: entitlements, error: entitlementsError } = await supabase
    .from("entitlements")
    .select("feature_key, limit_value")
    .eq("org_id", workspaceId)
    .order("feature_key", { ascending: true });

  if (entitlementsError) {
    throw new Error(`Failed to load entitlements: ${entitlementsError.message}`);
  }

  const features = await Promise.all(
    (entitlements ?? []).map(async (entitlement) => {
      const used = await getUsageForCurrentPeriod(supabase, workspaceId, entitlement.feature_key);
      const remaining =
        entitlement.limit_value === null ? null : Math.max(entitlement.limit_value - used, 0);
      return {
        featureKey: entitlement.feature_key,
        limit: entitlement.limit_value,
        used,
        remaining,
      };
    })
  );

  return { plan: subscription.plan, status: subscription.status, features };
}
