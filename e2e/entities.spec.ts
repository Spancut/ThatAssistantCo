import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { deleteTestUserAndOrgs, signOut } from "./helpers";

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // rely on already-exported env vars
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DEMO_PASSWORD = "dev-password-only-123!";

function admin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function createConfirmedUser(emailPrefix: string) {
  const email = `${emailPrefix}-${Date.now()}@thatassistant.dev`;
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: emailPrefix },
  });
  if (error) throw error;
  return { email, userId: data.user.id };
}

test.describe("Client/contact/knowledge cross-org isolation", () => {
  test("a client created in one Partner workspace is invisible from another Partner workspace", async ({
    page,
  }) => {
    const clientName = `Cross-Org Test Client ${Date.now()}`;

    // Create the client as the seeded partner-demo user.
    await page.goto("/login");
    await page.getByLabel("Email").fill("partner-demo@thatassistant.dev");
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/partner-demo\/dashboard$/, { timeout: 15_000 });

    await page.goto("/partner-demo/clients");
    await page.getByLabel("Client name").fill(clientName);
    await page.getByRole("button", { name: "Add client" }).click();
    await expect(page).toHaveURL(/\/partner-demo\/clients\/[^/]+$/, { timeout: 15_000 });
    const clientId = page.url().split("/").pop()!;
    await expect(page.getByRole("heading", { name: clientName })).toBeVisible();

    // A second, unrelated Partner user in their own workspace should never
    // see this client — neither in their list nor by guessing the URL.
    const second = await createConfirmedUser("cross-org-partner");
    try {
      await signOut(page);
      await page.getByLabel("Email").fill(second.email);
      await page.getByLabel("Password").fill(DEMO_PASSWORD);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/onboarding$/, { timeout: 15_000 });

      await page.getByLabel("Workspace name").fill("Second Partner Co");
      await page.getByRole("button", { name: "Create workspace" }).click();
      await expect(page).toHaveURL(/\/[^/]+\/dashboard$/, { timeout: 15_000 });
      const secondOrgSlug = page.url().split("/").at(-2)!;

      await page.goto(`/${secondOrgSlug}/clients`);
      await expect(page.getByText(clientName)).toHaveCount(0);

      // Guessing partner-demo's client id under their own org slug must 404
      // — proves this is row-level (org_id) isolation, not just "you can't
      // browse to a workspace you're not a member of."
      await page.goto(`/${secondOrgSlug}/clients/${clientId}`);
      await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    } finally {
      await deleteTestUserAndOrgs(admin(), second.userId);
      await admin().from("client_profiles").delete().eq("id", clientId);
    }
  });

  test("a contact created in one Founder workspace is invisible from another Founder workspace", async ({
    page,
  }) => {
    const contactName = `Cross-Org Test Contact ${Date.now()}`;

    await page.goto("/login");
    await page.getByLabel("Email").fill("founder-demo@thatassistant.dev");
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/founder-demo\/dashboard$/, { timeout: 15_000 });

    await page.goto("/founder-demo/contacts");
    await page.getByLabel("Name").fill(contactName);
    await page.getByRole("button", { name: "Add contact" }).click();
    await expect(page).toHaveURL(/\/founder-demo\/contacts\/[^/]+$/, { timeout: 15_000 });
    const contactId = page.url().split("/").pop()!;
    await expect(page.getByRole("heading", { name: contactName })).toBeVisible();

    const second = await createConfirmedUser("cross-org-founder");
    try {
      await signOut(page);
      await page.getByLabel("Email").fill(second.email);
      await page.getByLabel("Password").fill(DEMO_PASSWORD);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/onboarding$/, { timeout: 15_000 });

      await page.getByLabel("Workspace name").fill("Second Founder Co");
      // Founder is the second product card — click it before submitting.
      await page.getByText("ThatAssistant Founder").click();
      await page.getByRole("button", { name: "Create workspace" }).click();
      await expect(page).toHaveURL(/\/[^/]+\/dashboard$/, { timeout: 15_000 });
      const secondOrgSlug = page.url().split("/").at(-2)!;

      await page.goto(`/${secondOrgSlug}/contacts`);
      await expect(page.getByText(contactName)).toHaveCount(0);

      await page.goto(`/${secondOrgSlug}/contacts/${contactId}`);
      await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    } finally {
      await deleteTestUserAndOrgs(admin(), second.userId);
      await admin().from("contacts").delete().eq("id", contactId);
    }
  });
});

test.describe("Pipeline stage changes", () => {
  test("changing pipeline_stage persists and writes an audit_event", async ({ page }) => {
    const contactName = `Stage Test Contact ${Date.now()}`;

    await page.goto("/login");
    await page.getByLabel("Email").fill("founder-demo@thatassistant.dev");
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/founder-demo\/dashboard$/, { timeout: 15_000 });

    await page.goto("/founder-demo/contacts");
    await page.getByLabel("Name").fill(contactName);
    await page.getByRole("button", { name: "Add contact" }).click();
    await expect(page).toHaveURL(/\/founder-demo\/contacts\/[^/]+$/, { timeout: 15_000 });
    const contactId = page.url().split("/").pop()!;

    try {
      await page.goto("/founder-demo/contacts");
      const stageSelect = page.getByLabel(`Pipeline stage for ${contactName}`);
      await expect(stageSelect).toHaveValue("new");

      await stageSelect.selectOption("qualified");
      // selectOption only waits for the DOM interaction, not the server
      // action it triggers — without this, reload() below races ahead and
      // can cancel the in-flight request before it persists anything.
      await page.waitForLoadState("networkidle");

      // Reload from the server (not just optimistic client state) to prove
      // the change actually persisted.
      await page.reload();
      await expect(page.getByLabel(`Pipeline stage for ${contactName}`)).toHaveValue("qualified");

      const { data: events, error } = await admin()
        .from("audit_events")
        .select("action, metadata, target_id")
        .eq("action", "contact.stage_changed")
        .eq("target_id", contactId)
        .order("created_at", { ascending: false })
        .limit(1);

      expect(error).toBeNull();
      expect(events).toHaveLength(1);
      expect(events![0].metadata).toMatchObject({ from: "new", to: "qualified" });
    } finally {
      await admin().from("contacts").delete().eq("id", contactId);
    }
  });
});
