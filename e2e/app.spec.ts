import { expect, test } from "@playwright/test";

test("muestra la portada del evento", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Gallardo Camp" }),
  ).toBeVisible();
  await expect(page).toHaveTitle(/Gallardo Camp/);
});

test("protege la administración y permite cerrar sesión", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(
    page.getByRole("link", { name: "Volver a la página principal" }),
  ).toHaveAttribute("href", "/");

  await page.getByLabel("Contraseña").fill("e2e-admin-password");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Administración" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Ir a la página del evento" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin$/);

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
});
