import { test, expect, type Page } from "@playwright/test";

// Authenticated dashboard pages (storageState from the setup project). To keep
// baselines stable, the calendar is pinned to a fixed past month — no "today"
// highlight, no Appointments — and the appointments list reflects an empty
// `appointments` collection (the seed only creates the Professional).

async function shot(page: Page, name: string) {
  await page.waitForLoadState("networkidle");
  expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(name);
}

test("appointments list", async ({ page }) => {
  await page.goto("/admin/appointments");
  await expect(page.getByRole("heading", { name: "Turnos" })).toBeVisible();
  await shot(page, "admin-appointments.png");
});

test("calendar view", async ({ page }) => {
  // A fixed month avoids day-to-day "today" drift in the baseline.
  await page.goto("/admin/calendar?month=2026-01");
  await expect(page.getByRole("heading", { name: /Enero 2026/ })).toBeVisible();
  await shot(page, "admin-calendar.png");
});
