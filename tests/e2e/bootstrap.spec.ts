import { expect, test } from "@playwright/test";

test("shows only the T000 placeholder shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "ThatAssistant OS — VA Edition" })).toBeVisible();
  await expect(page.getByText("Product functionality begins only through approved")).toBeVisible();
});
