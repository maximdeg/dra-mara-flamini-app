# 06 — Calendar view (/admin/calendar)

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Frontend](../PRD.md)

## What to build

Restyle the calendar view at `/admin/calendar` inside the admin shell so the Professional can
see Appointments per day at a glance. Days carry their Appointments with **StatusBadge**
(reused) cues, the current month/navigation is clearly styled, and the layout works from
tablet width up.

Presentation-only: the month/data fetching and the derived Status of each Appointment are
unchanged.

## Acceptance criteria

- [x] `/admin/calendar` is restyled to show Appointments grouped by day with clear visual hierarchy.
- [x] Status is conveyed via the reused StatusBadge (or equivalent token-based cue).
- [x] Month navigation is styled and behaves as before.
- [x] The view is usable at tablet width and up.
- [x] A DOM snapshot for the calendar is added once structure is settled.
- [x] The existing Vitest suite still passes unchanged.

## Blocked by

- [04 — Admin shell + sign-in](./04-admin-shell-sign-in.md)

## Comments

- 2026-06-21: Restyled `/admin/calendar`. The page keeps its server data fetch,
  month/day parsing, cancelled-excluded workload filter, and `buildMonthCalendar`.
  Extracted a presentational `MonthCalendarGrid` (Monday-start grid: in-month days
  link to select themselves, today's number is a filled circle, the selected day is
  highlighted with `aria-current="date"`, per-day count badge with singular/plural
  "turno(s)"; the grid scrolls horizontally on narrow viewports). Month nav is now
  ghost `Button as={Link}` prev/next around the month title. The selected-day agenda
  is a Card list where each Appointment shows time, patient, Visit Type, and a reused
  `StatusBadge`. Dropped the redundant "← Panel" link (shell nav covers it). No new
  primitive needed — the calendar grid is a bespoke component (the Table primitive's
  data-table styling doesn't fit a month grid).
- Tests: MonthCalendarGrid selected-day + count pluralization, spill-days-not-linked,
  and a structure snapshot (Link mocked to an anchor). `npm run typecheck` clean,
  `npm test` 151/151 (123 existing unchanged + 28 ui), `npm run build` exit 0 (only
  the pre-existing `jose`/Edge-Runtime warning).
- [03 — Confirmation + patient cancel](./03-confirmation-patient-cancel.md)
