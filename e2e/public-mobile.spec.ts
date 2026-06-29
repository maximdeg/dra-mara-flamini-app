import { test, expect, type Page } from "@playwright/test";

// Public, patient-facing pages at a phone viewport (#20/#21). Mirrors the stable
// views in public.spec.ts but under the `public-mobile` project (iPhone-13:
// 390×844, Chromium mobile emulation), guarding the phone layout against
// regressions: full-page pixels plus an explicit no-sideways-scroll check (the
// overflow that used to make phones shrink the whole page to fit).
//
// Baselines are platform-tagged (…-public-mobile-win32.png); regenerate on the
// same OS with `npm run test:visual:update`. See README.md.

async function shot(page: Page, name: string) {
  await page.waitForLoadState("networkidle");
  // The headline goal of the pass: the phone layout must not scroll sideways.
  const overflowX = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflowX, `${name}: horizontal overflow (px)`).toBeLessThanOrEqual(1);
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
