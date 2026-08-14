import { expect, test } from "@playwright/test";

test("muestra la portada del evento", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Gallardo Camp 2026" }),
  ).toBeVisible();
  await expect(page).toHaveTitle(/Gallardo Camp/);
  await expect(page.getByText("v0.1.0", { exact: true })).toBeAttached();
});

test("adapta la navegación a cada tamaño de pantalla", async ({ page }, testInfo) => {
  await page.goto("/admin/login");

  if (testInfo.project.name.includes("mobile")) {
    const menuButton = page.getByRole("button", { name: "Abrir menú" });
    await expect(menuButton).toBeVisible();
    await expect(page.getByRole("link", { name: "Agenda", exact: true })).toBeHidden();
    await menuButton.click();
  } else {
    await expect(page.getByRole("button", { name: "Abrir menú" })).toBeHidden();
  }

  await page.getByRole("link", { name: "Agenda", exact: true }).click();
  await expect(page).toHaveURL(/\/agenda$/);
  await page.getByRole("link", { name: "Gallardo Camp", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("permite consultar la agenda y sus detalles", async ({ page }, testInfo) => {
  await page.goto("/agenda");
  await expect(
    page.getByRole("heading", { name: "Agenda del fin de semana" }),
  ).toBeVisible();

  if (testInfo.project.name.includes("mobile")) {
    await expect(page.getByText("Vie 28", { exact: true })).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: "Viernes 28 de agosto" })
        .getByText("22:00", { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: "Viernes 28 de agosto" })
        .getByText("09:00", { exact: true }),
    ).not.toBeVisible();
    await page.getByRole("button", { name: "Día siguiente" }).click();
    await expect(page.getByText("Sáb 29", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Día siguiente" }).click();
    await expect(page.getByText("Dom 30", { exact: true })).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: "Domingo 30 de agosto" })
        .getByRole("button", { name: /Campeonato de dominó/ }),
    ).toBeVisible();
    await page
      .getByRole("region", { name: "Domingo 30 de agosto" })
      .getByRole("button", { name: /Campeonato de dominó/ })
      .click();
  } else {
    await expect(
      page.getByRole("region", { name: "Viernes 28 de agosto" }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Sábado 29 de agosto" }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Domingo 30 de agosto" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: "Sábado 29 de agosto" })
        .getByRole("button", { name: /Concurso de talentos/ }),
    ).toBeVisible();
    await page
      .getByRole("region", { name: "Domingo 30 de agosto" })
      .getByRole("button", { name: /Campeonato de dominó/ })
      .click();
  }

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByText("El Campo", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("dialog").getByText(/^(Obligatoria|Opcional)$/),
  ).toBeVisible();
  await expect(page.getByRole("dialog").getByText("5 puntos por participar")).toBeVisible();
  await expect(page.getByRole("dialog").getByText(/15 puntos al primer puesto/)).toBeVisible();
  await page.getByRole("button", { name: "Cerrar detalle" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
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
