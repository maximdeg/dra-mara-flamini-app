import { test as setup, expect } from "@playwright/test";

// Signs the Professional in once and saves the session, so the admin specs run
// authenticated without repeating the sign-in. Credentials come from the seeded
// Professional (npm run seed:professional).
const authFile = "e2e/.auth/professional.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/admin/sign-in");

  // Retry fill + submit until the client has hydrated and the submit handler
  // navigates. (networkidle isn't a hydration signal here — the form has no
  // pre-hydration fetches — so an early click would be lost.)
  await expect(async () => {
    await page.getByLabel(/Email/).fill("mara@example.com");
    await page.getByLabel(/Contraseña/).fill("change-me");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await page.waitForURL("**/admin", { timeout: 3000 });
  }).toPass({ timeout: 30000 });

  await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();
  await page.context().storageState({ path: authFile });
});
