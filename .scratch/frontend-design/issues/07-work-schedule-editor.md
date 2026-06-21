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

- [ ] `/admin/schedule` is restyled as clear forms/cards for working weekdays and their time ranges.
- [ ] Reducing availability that collides with Scheduled Appointments surfaces the cancel-first requirement via a confirm Dialog; the underlying rule is unchanged.
- [ ] Saves show Toast feedback (success/error).
- [ ] The editor is usable at tablet width and up.
- [ ] A DOM snapshot for the schedule editor is added once structure is settled.
- [ ] The existing Vitest suite still passes unchanged.

## Blocked by

- [04 — Admin shell + sign-in](./04-admin-shell-sign-in.md)
- [03 — Confirmation + patient cancel](./03-confirmation-patient-cancel.md)
