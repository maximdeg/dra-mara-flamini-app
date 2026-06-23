import { test, expect, type Page } from "@playwright/test";

// Public, patient-facing pages. No auth. These views are stable run-to-run: the
// home and sign-in pages are static, and the booking form's date/time options
// stay collapsed inside native selects, so the booking-window drift never shows.

// Capture with a plain page.screenshot + toMatchSnapshot. (toHaveScreenshot's
// stability loop surfaces Next's late dev-tools badge; this does not.)
async function shot(page: Page, name: string) {
  await page.waitForLoadState("networkidle");
  expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(name);
}

test("home page", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Tu Piel, Nuestra Especialidad/ }),
  ).toBeVisible();
  await shot(page, "home.png");
});

test("sign-in page", async ({ page }) => {
  await page.goto("/admin/sign-in");
  await expect(page.getByRole("heading", { name: "Ingresar" })).toBeVisible();
  await shot(page, "sign-in.png");
});

test("booking form — initial", async ({ page }) => {
  await page.goto("/agendar-visita");
  await expect(
    page.getByRole("heading", { name: "Agendar una visita" }),
  ).toBeVisible();
  await shot(page, "booking-initial.png");
});

test("booking form — Deposit shown", async ({ page }) => {
  await page.goto("/agendar-visita");
  await expect(
    page.getByRole("heading", { name: "Agendar una visita" }),
  ).toBeVisible();

  // A Self-Pay Practice shows the Deposit (seña) acknowledgment. Retry the first
  // selection until the client has hydrated (the sub-type field appears).
  await expect(async () => {
    await page.getByLabel(/Tipo de visita/).selectOption({ label: "Práctica" });
    await expect(page.getByLabel(/Tipo de práctica/)).toBeVisible({
      timeout: 2000,
    });
  }).toPass({ timeout: 20000 });

  await page
    .getByLabel(/Tipo de práctica/)
    .selectOption({ label: "Criocirugía" });
  await page.getByLabel(/Cobertura/).selectOption({ label: "Practica Particular" });

  await expect(page.getByText(/Seña requerida/)).toBeVisible();
  await shot(page, "booking-deposit.png");
});
