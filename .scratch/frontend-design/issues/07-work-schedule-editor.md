# 07 — Work Schedule editor (/admin/schedule)

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Frontend](../PRD.md)

## What to build

Restyle the Work Schedule editor at `/admin/schedule` inside the admin shell. The recurring
weekly availability — which weekdays are worked and the time ranges within each working day —
is presented as clear Card/form layouts using the Field and Button primitives. The key
interaction to surface clearly: when the Professional **reduces availability** in a way that
collides with existing Scheduled Appointments, the change must require cancelling those
Appointments first — present that gate through a confirm **Dialog**, with **Toast** feedback
on save.

Presentation-only: the collision rule, the resulting Cancellation Notices, and the schedule
server actions are unchanged.

## Acceptance criteria

- [x] `/admin/schedule` is restyled as clear forms/cards for working weekdays and their time ranges.
- [x] Reducing availability that collides with Scheduled Appointments surfaces the cancel-first requirement via a confirm Dialog; the underlying rule is unchanged.
- [x] Saves show Toast feedback (success/error).
- [x] The editor is usable at tablet width and up.
- [x] A DOM snapshot for the schedule editor is added once structure is settled.
- [x] The existing Vitest suite still passes unchanged.

## Blocked by

- [04 — Admin shell + sign-in](./04-admin-shell-sign-in.md)
- [03 — Confirmation + patient cancel](./03-confirmation-patient-cancel.md)

## Comments

- 2026-06-21: Restyled `/admin/schedule`. The `ScheduleEditor` keeps all its state
  logic (per-weekday toggle, time ranges, save, cancel-collision) and the unchanged
  `saveScheduleAction`/`cancelCollisionAction`. Each weekday is now a Card with a
  working-day checkbox and, when working, styled time-range rows (Button "Quitar" /
  "Agregar rango"); non-working days read "No se atiende." Save is the Button primitive
  (busy on the transition). Feedback moved to Toasts: success → "Horarios guardados.",
  error → toast. The collision case (reducing availability that hits Scheduled
  Appointments) now surfaces in a Dialog explaining the cancel-first requirement and
  listing the conflicts; cancelling one calls the action, toasts, and removes it, and
  when all are cleared the Dialog shows "Conflictos resueltos. Volvé a guardar." The
  underlying collision rule and the Cancellation Notices are unchanged. Dropped the
  redundant "← Panel" link.
- Tests: save→success-toast, collision→dialog→cancel→resolved flow, and an editor
  structure snapshot (actions mocked, ToastProvider wrapper). `npm run typecheck`
  clean, `npm test` 154/154 (123 existing unchanged + 31 ui), `npm run build` exit 0
  (only the pre-existing `jose`/Edge-Runtime warning).
