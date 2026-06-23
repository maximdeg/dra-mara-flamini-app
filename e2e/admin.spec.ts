import { test, expect, type Page } from "@playwright/test";

// Authenticated dashboard pages (storageState from the setup project). To keep
// baselines stable, every screenshotted view is pinned to a deterministic state
// that doesn't depend on the database's contents or on "today": the calendar to
// a fixed past month, and the appointments list to a fixed empty date window.

// A one-day window in the distant past — before the clinic ever took bookings,
// and outside the today→+31d booking window where new Appointments can land.
// Filtering to it yields an empty list on any database, so the baseline no
// longer assumes an empty `appointments` collection (it used to fail the moment
// the dev database held a single booking). Derived Status is a function of
// `now`, so a populated table could never be a stable baseline anyway — the
// empty state is the one we can pin.
const EMPTY_WINDOW = "from=2000-01-01&to=2000-01-01";

async function shot(page: Page, name: string) {
  await page.waitForLoadState("networkidle");
  expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(name);
}

test("appointments list", async ({ page }) => {
  await page.goto(`/admin/appointments?${EMPTY_WINDOW}`);
  await expect(page.getByRole("heading", { name: "Turnos" })).toBeVisible();
  await expect(
    page.getByText("No hay turnos para este filtro."),
  ).toBeVisible();
  await shot(page, "admin-appointments.png");
});

test("calendar view", async ({ page }) => {
  // A fixed month avoids day-to-day "today" drift in the baseline.
  await page.goto("/admin/calendar?month=2026-01");
  await expect(page.getByRole("heading", { name: /Enero 2026/ })).toBeVisible();
  await shot(page, "admin-calendar.png");
});
