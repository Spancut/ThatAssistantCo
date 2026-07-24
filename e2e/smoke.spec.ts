import { test, expect } from "@playwright/test";

const DEMO_PASSWORD = "dev-password-only-123!";

test.describe("Milestone 1 smoke test", () => {
  test("sign-up never silently grants a session, and surfaces Supabase's real response", async ({
    page,
  }) => {
    // Supabase validates that the signup email's domain is deliverable
    // (unlike the Admin API used by scripts/seed.ts), so a made-up domain
    // like thatassistant.dev is rejected. gmail.com has real MX records.
    //
    // Repeated live runs of this test against the same free-tier Supabase
    // project can also legitimately hit Supabase's own signup rate limit
    // instead of reaching the "confirm your email" path. Both are real,
    // correctly-surfaced responses from Supabase (see the Alert in
    // components/auth/signup-form.tsx) — the thing this test actually
    // guards is "never silently redirect into the app without a session."
    const uniqueEmail = `thatassistant.smoke.test+${Date.now()}@gmail.com`;

    await page.goto("/signup");
    await page.getByLabel("Full name").fill("Smoke Test User");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Password").fill("supersecret123");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByRole("alert").first()).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/signup$/);
  });

  test("partner workspace shows Partner-specific navigation and dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("partner-demo@thatassistant.dev");
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/partner-demo\/dashboard$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Client Hub")).toBeVisible();
    await expect(page.getByText("Delivery Board")).toBeVisible();
    await expect(page.getByText("Command Centre")).toHaveCount(0);
  });

  test("founder workspace shows Founder-specific navigation and dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("founder-demo@thatassistant.dev");
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/founder-demo\/dashboard$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Command Centre" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Command Centre" })).toBeVisible();
    await expect(page.getByText("Contact & Lead Hub")).toBeVisible();
    await expect(page.getByText("Follow-Up Operator")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toHaveCount(0);
  });

  test("settings page allows renaming the workspace and shows members", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("partner-demo@thatassistant.dev");
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/partner-demo\/dashboard$/, { timeout: 15_000 });

    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/partner-demo\/settings$/);

    const nameInput = page.getByLabel("Workspace name");
    await expect(nameInput).toHaveValue("Acme Partner Demo");
    await expect(page.getByText("Owner")).toBeVisible();
  });
});
