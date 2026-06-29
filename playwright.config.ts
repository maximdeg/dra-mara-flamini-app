import { defineConfig, devices } from "@playwright/test";

// Visual-regression suite (slice 11). Drives the production build with Playwright
// and compares full-page screenshots against committed baselines. Baselines are
// platform-tagged by Playwright (e.g. *-chromium-win32.png), so regenerate them
// on the same OS you assert on. See e2e/README.md.
//
// Prerequisites: a reachable MongoDB (per .env) and a seeded Professional
// (`npm run seed:professional`) — the admin specs sign in through the UI.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  // Serial: keeps screenshots deterministic and warms the server before the
  // admin specs (the setup project signs in first).
  workers: 1,
  reporter: "list",
  use: {
    // A dedicated port so the suite always drives its own production server,
    // never a stray `next dev` on 3000 (which adds a dev indicator overlay).
    baseURL: "http://localhost:3100",
    ...devices["Desktop Chrome"],
  },
  // A little tolerance for font anti-aliasing across runs. Animations are
  // disabled automatically by toHaveScreenshot.
  // We assert with `toMatchSnapshot` over a plain `page.screenshot` (see the
  // specs): unlike `toHaveScreenshot`, that capture does not surface Next's
  // late-mounting dev-tools badge, keeping baselines clean.
  expect: {
    toMatchSnapshot: { maxDiffPixelRatio: 0.02 },
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "public",
      testMatch: /public\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // Same public pages at a phone viewport. iPhone-13 geometry pinned to
      // Chromium — the only browser the suite installs, and the engine that
      // supports `isMobile` emulation. Guards the #20/#21 mobile pass.
      name: "public-mobile",
      testMatch: /public-mobile\.spec\.ts/,
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "admin",
      testMatch: /admin\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/professional.json",
      },
    },
  ],
  webServer: {
    // Build then serve production on a dedicated port. Building here keeps the
    // baselines valid even if a co-running `next dev` clobbered `.next`.
    command: "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      // Auth.js v5 only trusts the request host in dev; under `next start` the
      // credentials sign-in needs this to accept localhost.
      AUTH_TRUST_HOST: "true",
      // Isolated build dir so a co-running `next dev` can't taint these pages.
      NEXT_DIST_DIR: ".next-e2e",
    },
  },
});
