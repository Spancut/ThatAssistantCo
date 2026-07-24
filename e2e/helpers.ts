import type { Page } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Seeded demo accounts (scripts/seed.ts). Real inbox we own (+alias), not a
 * fake/unowned domain — see docs/decisions.md. Centralized here so a future
 * rename only happens in one place instead of drifting across spec files.
 */
export const PARTNER_DEMO_EMAIL = "danielcutrona+seed-partner@gmail.com";
export const FOUNDER_DEMO_EMAIL = "danielcutrona+seed-founder@gmail.com";
export const DEMO_PASSWORD = "dev-password-only-123!";

/**
 * Builds a unique-but-real test-user email for a throwaway Admin-API-created
 * account. Still under a domain we actually own, so even though
 * admin.createUser({ email_confirm: true }) never sends mail today, this
 * costs nothing and removes the fake domain as a future footgun.
 */
export function testEmail(label: string) {
  return `danielcutrona+e2e-${label}-${Date.now()}@gmail.com`;
}

/**
 * Signs the current user out via the real UI. Required before signing in as
 * a different user within the same test — proxy.ts redirects an
 * already-authenticated session away from /login back into the app, so
 * navigating straight to /login while still signed in as someone else does
 * NOT show a login form (discovered as a real test bug, not a hypothetical).
 */
export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await page.waitForURL(/\/login$/, { timeout: 15_000 });
}

/**
 * Deletes a test user created via the Admin API, including any
 * organizations they created.
 *
 * organizations.created_by references auth.users(id) with NO cascade (an
 * org must keep pointing at its creator even if other members remain), so
 * admin.auth.admin.deleteUser() silently fails — via a Postgres foreign key
 * violation surfaced as an API error we weren't checking — if the user
 * created any workspace. Deleting the organization row first cascades away
 * every org-scoped table (memberships, client_profiles, contacts,
 * knowledge_base_items, audit_events, subscriptions, entitlements,
 * usage_events, notifications — all FK org_id ON DELETE CASCADE), which
 * clears the path for the user delete to actually succeed.
 *
 * This was discovered because two earlier test runs left "notification
 * smoke" users and organizations permanently in the live project — the
 * cleanup call was never checked for an error. See docs/decisions.md.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deleteTestUserAndOrgs(admin: SupabaseClient<any>, userId: string) {
  const { data: orgs, error: orgsError } = await admin
    .from("organizations")
    .select("id")
    .eq("created_by", userId);
  if (orgsError) throw new Error(`Failed to look up orgs for cleanup: ${orgsError.message}`);

  for (const org of orgs ?? []) {
    const { error } = await admin.from("organizations").delete().eq("id", org.id);
    if (error) throw new Error(`Failed to delete org ${org.id} during cleanup: ${error.message}`);
  }

  const { error: userError } = await admin.auth.admin.deleteUser(userId);
  if (userError) throw new Error(`Failed to delete test user ${userId}: ${userError.message}`);
}
