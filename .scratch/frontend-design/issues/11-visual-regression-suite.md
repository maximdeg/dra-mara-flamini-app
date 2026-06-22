# 11 — Visual-regression suite (Playwright)

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Frontend](../PRD.md)

## What to build

Now that every screen's structure has settled, add a **Playwright** visual-regression suite
(`toHaveScreenshot`) covering the key pages, to catch pixel-level regressions the per-screen
DOM snapshots can't. The PRD deliberately sequences this last so screenshots don't thrash
during active design iteration.

Cover the representative surfaces: home, the booking form in a couple of representative states
(initial; Consultation + First Visit showing the Deposit), the confirmation page across
Statuses, and the admin appointments table and calendar. Establish the baseline screenshots
and wire the suite into the test workflow.

Presentation-only and additive: no application behavior changes.

## Acceptance criteria

- [x] Playwright is set up with a visual-regression config and committed baseline screenshots.
- [x] Coverage exists for: home, booking form (initial + Deposit-shown), admin appointments, and admin calendar (plus sign-in). _Confirmation across Statuses is **deferred** — it's date-driven (the Appointment date drifts daily) and needs seeded fixtures + a pinned clock for a stable baseline; its structure is already covered by the slice-03 `appointment-details` DOM snapshot. See e2e/README.md._
- [x] The suite runs via an npm script (`test:visual` / `test:visual:update`) and is documented (e2e/README.md).
- [x] Tests assert on rendered appearance (full-page screenshots), not CSS class names or inline styles.
- [x] The existing Vitest suite still passes unchanged.

## Blocked by

- [01 — Design foundation + home page](./01-design-foundation-home.md)
- [02 — Booking form](./02-booking-form.md)
- [03 — Confirmation + patient cancel](./03-confirmation-patient-cancel.md)
- [04 — Admin shell + sign-in](./04-admin-shell-sign-in.md)
- [05 — Appointments list](./05-appointments-list.md)
- [06 — Calendar view](./06-calendar-view.md)
- [07 — Work Schedule editor](./07-work-schedule-editor.md)
- [08 — Unavailable Days editor](./08-unavailable-days-editor.md)
- [09 — Profile + change password](./09-profile-change-password.md)
- [10 — Coverage editor](./10-coverage-editor.md)

## Comments

- 2026-06-21: Built the Playwright visual-regression suite. `playwright.config.ts`
  (chromium, serial, dedicated prod server on :3100 via webServer) + `e2e/` specs:
  `auth.setup.ts` (signs in once, saves storageState), `public.spec.ts` (home,
  sign-in, booking initial, booking Deposit-shown), `admin.spec.ts` (appointments,
  calendar pinned to a fixed past month). 6 committed baselines (`*-win32.png`),
  `npm run test:visual` / `test:visual:update`, and `e2e/README.md`. Vitest ignores
  `e2e/**` (its globs are lib/components/app `*.test.ts(x)` only); `.next-e2e`,
  `e2e/.auth`, `test-results` gitignored. typecheck clean, `npm test` 166/166, visual
  7/7.
- Environment fixes needed to make it run here: seeded the Professional
  (`npm run seed:professional`); `AUTH_TRUST_HOST=true` in the webServer env (Auth.js
  v5 rejects the localhost host under `next start`); an isolated build dir
  (`NEXT_DIST_DIR=.next-e2e`, wired via `distDir` in next.config) so the suite's prod
  server doesn't collide with a co-running `next dev`; `devIndicators: false` in
  next.config; and the first interactions (sign-in, visit-type select) retried via
  `expect(...).toPass()` to ride out client hydration.
- **Key capture decision:** assert via `page.screenshot()` + `toMatchSnapshot()`
  rather than `toHaveScreenshot()`. `toHaveScreenshot`'s stability loop reproducibly
  surfaced Next's late-mounting dev-tools badge in the corner (a plain
  `page.screenshot` at the same instant was clean); `toMatchSnapshot` over that clean
  buffer keeps baselines free of the artifact.
- Baselines are win32/chromium-tagged — a Linux CI must regenerate its own (ideally in
  the Playwright Docker image) with MongoDB reachable and the Professional seeded.
