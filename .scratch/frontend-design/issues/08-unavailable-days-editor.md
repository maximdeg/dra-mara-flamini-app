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

- [x] `/admin/unavailable-days` is restyled with a clear add control and a styled list of existing Unavailable Days.
- [x] Removing (and, where applicable, adding a colliding) Unavailable Day goes through a confirm Dialog; the underlying rules are unchanged.
- [x] Actions show Toast feedback.
- [x] The editor is usable at tablet width and up.
- [x] A DOM snapshot for the editor is added once structure is settled.
- [x] The existing Vitest suite still passes unchanged.

## Blocked by

- [04 — Admin shell + sign-in](./04-admin-shell-sign-in.md)
- [03 — Confirmation + patient cancel](./03-confirmation-patient-cancel.md)

## Comments

- 2026-06-21: Restyled `/admin/unavailable-days`. The add control is a Card with a
  Field date input + Button; the blocked-days list is a styled Card list, each row a
  date + a "Quitar" Button. Removing a day now goes through a confirm Dialog ("¿Quitar
  este día?") before calling `removeUnavailableDayAction`; the add-collision case (the
  chosen date has Scheduled Appointments) surfaces in a Dialog listing the conflicts
  with per-item cancel, mirroring the schedule editor. All actions report via Toast
  (día agregado / día quitado / turno cancelado / errors). The add/remove/collision
  rules and the `addUnavailableDayAction`/`removeUnavailableDayAction`/
  `cancelCollisionAction` server actions are unchanged. Dropped the redundant "← Panel"
  link.
- Tests: add→success-toast, remove→confirm-dialog→toast, add-collision→dialog, and a
  manager structure snapshot (actions + router mocked, ToastProvider wrapper).
  `npm run typecheck` clean, `npm test` 158/158 (123 existing unchanged + 35 ui),
  `npm run build` exit 0 (only the pre-existing `jose`/Edge-Runtime warning).
