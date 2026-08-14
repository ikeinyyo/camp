import { expect, test } from "@playwright/test";

test("muestra la portada del evento", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Gallardo Camp" }),
  ).toBeVisible();
  await expect(page).toHaveTitle(/Gallardo Camp/);
});
