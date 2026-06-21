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

- [x] `/admin/appointments` is restyled as a legible Table with per-row StatusBadge.
- [x] The existing filters are presented as styled controls and still filter as before.
- [x] Cancelling an Appointment goes through a confirm Dialog and shows a Toast; the underlying cancel behavior (no 24-hour limit for the Professional) is unchanged.
- [x] `Table` exists as a reusable CSS-Module primitive.
- [x] A DOM snapshot for the appointments table is added once structure is settled.
- [x] The existing Vitest suite still passes unchanged.

## Blocked by

- [04 — Admin shell + sign-in](./04-admin-shell-sign-in.md)

## Comments

- 2026-06-21: Restyled `/admin/appointments`. Added the `Table` primitive
  (`components/ui/table.tsx`: `Table`/`THead`/`TBody`/`TR`/`TH`/`TD`, wrapped for
  horizontal scroll). The page keeps its server-side data fetch and GET filter
  parsing; the filter form is now Field selects/date inputs + a `Button` inside a
  Card. Extracted a presentational `AppointmentsTable` (per-row `StatusBadge`, the
  cancel action only on scheduled rows) so the table is snapshot-testable. The cancel
  action moved from a progressive-enhancement `<form action>` to a client
  `CancelAppointmentButton` that confirms in a `Dialog` and reports via `Toast`; the
  `cancelAppointmentAsProfessional` server action was refactored from `FormData` to an
  `id: string` arg (same auth check, `cancel(id,"professional",…)`, and
  `revalidatePath`). The dashboard cancel still has no 24-hour limit and still enqueues
  a Cancellation Notice. Dropped the redundant "← Panel" link (the shell nav covers it).
- Tests: AppointmentsTable structure snapshot + "cancel only on scheduled rows";
  CancelAppointmentButton dialog→action→toast flow (action + router mocked).
  `npm run typecheck` clean, `npm test` 148/148 (123 existing unchanged + 25 ui),
  `npm run build` exit 0 (only the pre-existing `jose`/Edge-Runtime warning).
- Note: cancel now requires JS (Dialog + Toast are client-side), a deliberate change
  from the no-JS form — appropriate for the JS-heavy dashboard and required by the
  Dialog/Toast acceptance criteria.
- [03 — Confirmation + patient cancel](./03-confirmation-patient-cancel.md)
