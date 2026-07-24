import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

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

test.describe("Billing and notifications", () => {
  test("settings/billing shows plan and usage for the seeded workspace", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("partner-demo@thatassistant.dev");
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/partner-demo\/dashboard$/, { timeout: 15_000 });

    await page.getByRole("link", { name: "Settings" }).click();
    await page.getByRole("link", { name: "Billing" }).click();
    await expect(page).toHaveURL(/\/partner-demo\/settings\/billing$/);

    await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
    // Rendered text content is lowercase ("trial plan" / "active") — a
    // `capitalize` CSS class changes how it's displayed, not the DOM text.
    await expect(page.getByText("trial plan")).toBeVisible();
    await expect(page.getByText("active", { exact: true })).toBeVisible();
    await expect(page.getByText("AI generations / month")).toBeVisible();
    await expect(page.getByText(/\d+ \/ 200 used/)).toBeVisible();
    await expect(page.getByText("Clients")).toBeVisible();
    // max_clients and max_contacts are both seeded unlimited.
    await expect(page.getByText(/unlimited/)).toHaveCount(2);
  });

  test("creating a workspace sends a welcome notification via the bell", async ({ page }) => {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const email = `notif-smoke-${Date.now()}@thatassistant.dev`;
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Notification Smoke Test" },
    });
    if (error) throw error;

    try {
      await page.goto("/login");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(DEMO_PASSWORD);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/onboarding$/, { timeout: 15_000 });

      // Partner is the default selected product; no need to click it.
      await page.getByLabel("Workspace name").fill("Notification Smoke Co");
      await page.getByRole("button", { name: "Create workspace" }).click();

      await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });

      const bellTrigger = page.getByRole("button", { name: /Notifications/ });
      await expect(bellTrigger).toBeVisible();
      await bellTrigger.click();

      await expect(page.getByText("Workspace created")).toBeVisible();
    } finally {
      await admin.auth.admin.deleteUser(created.user.id);
    }
  });
});
