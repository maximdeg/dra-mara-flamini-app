# 10 — Appointments list + filters + Professional cancel

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Appointment Booking](../PRD.md)

## What to build

The dashboard Appointments view. The Professional sees all Appointments with their (derived)
Status and can filter by Status, date, and Visit Type. The Professional can cancel **any**
Appointment at **any time** — no 24-hour restriction — reusing the Cancellation module with
`actor=Professional`, which enqueues a **Cancellation Notice**.

## Acceptance criteria

- [x] The dashboard lists Appointments showing the derived Status.
- [x] Filtering by Status, date, and Visit Type works.
- [x] The Professional can cancel any Scheduled Appointment regardless of timing.
- [x] A Professional cancellation enqueues a Cancellation Notice.
- [x] Tests cover filtering and the Professional cancellation path.

## Blocked by

- [09 — Professional authentication + admin shell](./09-professional-auth-admin-shell.md)
- [08 — Patient cancellation + Cancellation Notice](./08-patient-cancellation.md)

## Comments

- 2026-06-20: Built around a deepening (architecture-review candidate A): a new **Appointment listing module** (`lib/appointments/appointment-listing.ts`) — `listAppointments(filter, deps) → AppointmentView[]` — owns "derive Status, then filter" in one place, the seam the dashboard list crosses now and the calendar (slice 11) crosses next. Because Completed is derived from `now`, a Status filter can't be a pure DB query: the module translates the **derived** Status filter into a **persisted** query (cancelled→cancelled; scheduled/completed→scheduled; plus date range + Visit Type), the repository pushes that to Mongo, then the module attaches `statusOf` and does the final scheduled-vs-completed partition in memory — so the date-threshold rule stays in `status.ts` and never leaks into a persistence adapter. The repository seam grew `findAppointments(query)` (persisted-terms `AppointmentQuery`: from/to/status/visitType, sorted date→time) in both adapters. UI: `/admin/appointments` (guarded) lists Appointments with their derived Status and a GET filter form (Status, Visit Type, date from/to); each Scheduled row has a Cancelar control wired to a `cancelAppointmentAsProfessional` server action that reuses the Cancellation module with `actor="professional"` (no 24h window) and enqueues a Cancellation Notice via `getCancellationDeps`; the action re-checks the session as defense-in-depth. Dashboard links to it. Tests (7 new): the full filter matrix through `listAppointments` — derived Completed/Scheduled/Cancelled, Visit Type, date range, and a combined range+Status — via the in-memory fake; the Professional-cancel path (no restriction + Notice enqueue) is already covered in `cancellation.test.ts`. `npm test` 81/81 green; `npm run typecheck` clean; `npm run build` clean (`/admin/appointments` compiled). Unblocks the calendar (slice 11), which reuses this listing seam.
