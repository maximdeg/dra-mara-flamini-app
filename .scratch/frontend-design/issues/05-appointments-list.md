# 05 — Appointments list (/admin/appointments)

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Frontend](../PRD.md)

## What to build

Restyle the Appointments list at `/admin/appointments` inside the admin shell. Introduce the
**Table** primitive and present Appointments as a readable table with **StatusBadge**
(reused from slice 03) for Scheduled / Cancelled / Completed, the existing filters styled as
real controls, and the cancel-appointment action wired through a confirm **Dialog** plus a
**Toast** for feedback. The Professional may cancel any Appointment with no 24-hour
restriction (unlike the patient side) — that behavior is unchanged; only the action's
presentation and confirmation gain styling.

Presentation-only: filtering logic, the cancel server action, and the resulting Cancellation
Notice are unchanged.

## Acceptance criteria

- [ ] `/admin/appointments` is restyled as a legible Table with per-row StatusBadge.
- [ ] The existing filters are presented as styled controls and still filter as before.
- [ ] Cancelling an Appointment goes through a confirm Dialog and shows a Toast; the underlying cancel behavior (no 24-hour limit for the Professional) is unchanged.
- [ ] `Table` exists as a reusable CSS-Module primitive.
- [ ] A DOM snapshot for the appointments table is added once structure is settled.
- [ ] The existing Vitest suite still passes unchanged.

## Blocked by

- [04 — Admin shell + sign-in](./04-admin-shell-sign-in.md)
- [03 — Confirmation + patient cancel](./03-confirmation-patient-cancel.md)
