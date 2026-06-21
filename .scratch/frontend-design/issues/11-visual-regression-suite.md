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

- [ ] Playwright is set up with a visual-regression config and committed baseline screenshots.
- [ ] `toHaveScreenshot` coverage exists for: home, booking form (initial + Deposit-shown state), confirmation (Scheduled/Cancelled/Completed), admin appointments, and admin calendar.
- [ ] The suite runs via an npm script and is documented briefly for how to update baselines.
- [ ] Tests assert on rendered appearance, not CSS class names or inline styles.
- [ ] The existing Vitest suite still passes unchanged.

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
