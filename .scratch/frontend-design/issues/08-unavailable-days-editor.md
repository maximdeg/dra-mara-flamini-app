# 08 — Unavailable Days editor (/admin/unavailable-days)

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Frontend](../PRD.md)

## What to build

Restyle the Unavailable Days manager at `/admin/unavailable-days` inside the admin shell. The
Professional adds and removes one-off blocked dates (a date that falls on a working weekday
but is made non-bookable). Present the add control and the list of existing Unavailable Days
as clear Card/Field/Button layouts; removing a date uses a confirm **Dialog** and shows
**Toast** feedback. If adding an Unavailable Day collides with existing Scheduled
Appointments, surface the same cancel-first requirement as the schedule editor.

Presentation-only: the add/remove behavior, the collision rule, and the server actions are
unchanged.

## Acceptance criteria

- [ ] `/admin/unavailable-days` is restyled with a clear add control and a styled list of existing Unavailable Days.
- [ ] Removing (and, where applicable, adding a colliding) Unavailable Day goes through a confirm Dialog; the underlying rules are unchanged.
- [ ] Actions show Toast feedback.
- [ ] The editor is usable at tablet width and up.
- [ ] A DOM snapshot for the editor is added once structure is settled.
- [ ] The existing Vitest suite still passes unchanged.

## Blocked by

- [04 — Admin shell + sign-in](./04-admin-shell-sign-in.md)
- [03 — Confirmation + patient cancel](./03-confirmation-patient-cancel.md)
