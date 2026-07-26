import { test, expect } from "@playwright/test";
import {
  DEMO_PASSWORD,
  FOUNDER_DEMO_EMAIL,
  PARTNER_DEMO_EMAIL,
  SIGNUP_TEST_EMAIL,
} from "./helpers";

test.describe("Milestone 1 smoke test", () => {
  test("sign-up never silently grants a session, and surfaces Supabase's real response", async ({
    page,
  }) => {
    // Supabase validates that the signup email's domain is deliverable, so
    // a made-up domain with no MX records is rejected outright (safe — no
    // send is attempted). gmail.com passes that check, which is exactly why
    // this address must be one we actually own rather than a fabricated one.
    //
    // Repeated live runs of this test against the same free-tier Supabase
    // project can also legitimately hit Supabase's own signup rate limit,
    // or "user already registered" on a second run against the same fixed
    // address. All are real, correctly-surfaced responses from Supabase
    // (see the Alert in components/auth/signup-form.tsx) — the thing this
    // test actually guards is "never silently redirect into the app
    // without a session."
    await page.goto("/signup");
    await page.getByLabel("Full name").fill("Smoke Test User");
    await page.getByLabel("Email").fill(SIGNUP_TEST_EMAIL);
    await page.getByLabel("Password").fill("supersecret123");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByRole("alert").first()).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/signup$/);
  });

  test("partner workspace shows Partner-specific navigation and dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(PARTNER_DEMO_EMAIL);
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
    await page.getByLabel("Email").fill(FOUNDER_DEMO_EMAIL);
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
    await page.getByLabel("Email").fill(PARTNER_DEMO_EMAIL);
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
