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

- [ ] `/admin/calendar` is restyled to show Appointments grouped by day with clear visual hierarchy.
- [ ] Status is conveyed via the reused StatusBadge (or equivalent token-based cue).
- [ ] Month navigation is styled and behaves as before.
- [ ] The view is usable at tablet width and up.
- [ ] A DOM snapshot for the calendar is added once structure is settled.
- [ ] The existing Vitest suite still passes unchanged.

## Blocked by

- [04 — Admin shell + sign-in](./04-admin-shell-sign-in.md)
- [03 — Confirmation + patient cancel](./03-confirmation-patient-cancel.md)
