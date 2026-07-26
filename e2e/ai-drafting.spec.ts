import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { DEMO_PASSWORD, FOUNDER_DEMO_EMAIL, PARTNER_DEMO_EMAIL } from "./helpers";

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // rely on already-exported env vars
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function admin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Real OpenAI calls take longer than the default action timeout.
const GENERATION_TIMEOUT = 45_000;

test.describe("AI drafting — live model path", () => {
  test("Partner: generate, edit, and approve a client draft records an audit event and a human value entry", async ({
    page,
  }) => {
    const { data: client, error: clientError } = await admin()
      .from("client_profiles")
      .select("id, name")
      .eq("name", "Brightleaf Bakery")
      .single();
    if (clientError || !client) throw new Error("Seeded client 'Brightleaf Bakery' not found — run npm run seed first");

    await page.goto("/login");
    await page.getByLabel("Email").fill(PARTNER_DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/partner-demo\/dashboard$/, { timeout: 15_000 });

    await page.goto(`/partner-demo/clients/${client.id}`);
    await expect(page.getByRole("heading", { name: "Draft email" })).toBeVisible();

    await page
      .getByLabel("Draft email", { exact: true })
      .fill(
        "Let them know we're excited to keep working with them and ask if next Tuesday afternoon works for a quick content review call."
      );
    await page.getByRole("button", { name: "Draft email" }).click();

    await expect(page).toHaveURL(/\/partner-demo\/outputs\/[^/]+$/, { timeout: GENERATION_TIMEOUT });
    const outputId = page.url().split("/").pop()!;

    // CardTitle renders a <div>, not a semantic heading — text-scoped, not role-scoped.
    await expect(page.getByRole("main").getByText("Review draft")).toBeVisible();
    await expect(page.getByLabel("Subject")).not.toHaveValue("");
    await expect(page.getByLabel("Body")).not.toHaveValue("");
    await expect(page.getByText("Confidence:")).toBeVisible();

    // Edit the body before approving, to exercise the edited_and_approved path.
    const bodyField = page.getByLabel("Body");
    const original = await bodyField.inputValue();
    await bodyField.fill(`${original}\n\nP.S. Added by a human reviewer.`);

    await page.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText("Edited & approved")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("P.S. Added by a human reviewer.")).toBeVisible();

    // Partner-only Human Value Layer.
    await expect(page.getByText("Human value")).toBeVisible();
    await page.getByLabel("Context you added").fill("Knew they preferred Tuesday afternoons.");
    await page.getByLabel("Judgment you applied").fill("Softened the ask since they're a long client.");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Saved")).toBeVisible({ timeout: 10_000 });

    await page.reload();
    await expect(page.getByText("Knew they preferred Tuesday afternoons.")).toBeVisible();

    const { data: auditEvents } = await admin()
      .from("audit_events")
      .select("action")
      .eq("target_type", "output")
      .eq("target_id", outputId);
    expect(auditEvents?.some((e) => e.action === "output.edited_and_approved")).toBe(true);

    const { data: hveAuditEvents } = await admin()
      .from("audit_events")
      .select("action")
      .eq("target_type", "human_value_entry")
      .eq("target_id", outputId);
    expect(hveAuditEvents?.some((e) => e.action === "human_value_entry.created")).toBe(true);

    const { data: humanValueEntry } = await admin()
      .from("human_value_entries")
      .select("context_added, judgment_applied")
      .eq("output_id", outputId)
      .single();
    expect(humanValueEntry?.context_added).toBe("Knew they preferred Tuesday afternoons.");

    // Deleting the workflow_run cascades the output, approval, and human
    // value entry with it — keeps the permanent demo workspace from
    // accumulating a new row set every time this suite runs. audit_events
    // are deliberately left in place: they're an append-only log (no
    // delete policy exists at all) and this really did happen.
    const { data: output } = await admin().from("outputs").select("workflow_run_id").eq("id", outputId).single();
    if (output) await admin().from("workflow_runs").delete().eq("id", output.workflow_run_id);
  });

  test("Founder: generate and approve a contact draft (unedited) records an audit event and shows no Human Value UI", async ({
    page,
  }) => {
    const { data: contact, error: contactError } = await admin()
      .from("contacts")
      .select("id, name")
      .eq("name", "Jordan Reyes")
      .single();
    if (contactError || !contact) throw new Error("Seeded contact 'Jordan Reyes' not found — run npm run seed first");

    await page.goto("/login");
    await page.getByLabel("Email").fill(FOUNDER_DEMO_EMAIL);
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/founder-demo\/dashboard$/, { timeout: 15_000 });

    await page.goto(`/founder-demo/contacts/${contact.id}`);
    await expect(page.getByRole("heading", { name: "Draft response" })).toBeVisible();

    await page
      .getByLabel("Draft response", { exact: true })
      .fill("They asked whether we can do weekly specials posts for their coffee shop. Let them know yes and ask about budget.");
    await page.getByRole("button", { name: "Draft response" }).click();

    await expect(page).toHaveURL(/\/founder-demo\/outputs\/[^/]+$/, { timeout: GENERATION_TIMEOUT });
    const outputId = page.url().split("/").pop()!;

    // CardTitle renders a <div>, not a semantic heading — text-scoped, not role-scoped.
    await expect(page.getByRole("main").getByText("Review draft")).toBeVisible();

    // Approve without editing -> plain "approved", not "edited_and_approved".
    await page.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText("Approved", { exact: true })).toBeVisible({ timeout: 10_000 });

    // Founder never gets the Human Value Layer.
    await expect(page.getByText("Human value")).toHaveCount(0);

    const { data: auditEvents } = await admin()
      .from("audit_events")
      .select("action")
      .eq("target_type", "output")
      .eq("target_id", outputId);
    expect(auditEvents?.some((e) => e.action === "output.approved")).toBe(true);

    const { data: hve } = await admin().from("human_value_entries").select("id").eq("output_id", outputId);
    expect(hve).toHaveLength(0);

    const { data: output } = await admin().from("outputs").select("workflow_run_id").eq("id", outputId).single();
    if (output) await admin().from("workflow_runs").delete().eq("id", output.workflow_run_id);
  });
});
