# 13 — Work Schedule management + collision-requires-cancellation guard

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Appointment Booking](../PRD.md)

## What to build

The Professional manages the **Work Schedule**: which weekdays are worked and the time
ranges within each working day. Reducing availability — un-marking a working weekday or
removing a time range — that collides with existing **Scheduled** Appointments is **blocked
until those Appointments are cancelled**; each such cancellation sends a Cancellation Notice.
Changes flow through to the Booking Window and Time Slots (Availability).

This slice introduces the shared collision guard that adding an Unavailable Day (slice 14)
also reuses.

## Acceptance criteria

- [x] The Professional can mark/unmark working weekdays and add/remove time ranges.
- [x] A reduction that collides with Scheduled Appointments is rejected and lists the colliding Appointments.
- [x] The Professional can cancel the colliding Appointments (each enqueuing a Cancellation Notice), after which the reduction applies.
- [x] Applied changes are reflected in the Booking Window and Time Slots.
- [x] Tests cover colliding and non-colliding changes.

## Blocked by

- [09 — Professional authentication + admin shell](./09-professional-auth-admin-shell.md)
- [08 — Patient cancellation + Cancellation Notice](./08-patient-cancellation.md)

## Comments

- 2026-06-20: The Work Schedule is now persisted and Professional-editable. New **Work Schedule seam** (`lib/availability/work-schedule-repository.ts`): `get()`/`save()`, with Mongo (single doc keyed `singleton`) + in-memory adapters and a composition root; `get()` falls back to the seeded `DEFAULT_WORK_SCHEDULE` until first saved, so Availability is unchanged before any edit. `getAvailabilityDeps` now reads the persisted schedule, so edits flow straight into the Booking Window and Time Slots (booking goes through the same composition). **The shared collision guard** lives in `lib/availability/collision.ts`: `fitsSchedule(appointment, schedule)`, a reusable `collidingAppointments(appointments, now, fits)` (slice 14 reuses it for the Unavailable-Day dimension), and `collidingWithSchedule`. Only future **Scheduled** Appointments collide — past (Completed) and Cancelled are filtered via the derived Status. Orchestration `updateWorkSchedule(proposed, deps)`: fetches future Scheduled via `findAppointments({ from: today, status: scheduled })` (the slice-10 seam), and either rejects with the colliding Appointments (saving nothing) or saves. `sanitizeWorkSchedule(input)` added as the trust boundary for edits (one entry per weekday in order; valid `HH:MM` ranges with start<end; ranges cleared for non-working days). UI: guarded `/admin/schedule` — a client editor holding the proposed schedule in state (so edits survive the collision round-trip) with weekday toggles + add/remove time-range rows; a `saveScheduleAction` server action runs the guard; on collision it lists the conflicting turnos with per-turn Cancelar buttons wired to `cancelCollisionAction` (Professional cancel → Cancellation Notice), after which the Professional re-saves. Dashboard links to it. Tests (14 new): `fitsSchedule`/`collidingWithSchedule` (un-mark weekday, narrowed range, past/cancelled never collide); `updateWorkSchedule` (saves non-colliding, blocks + saves nothing on collision, applies after the collider is cancelled); and `sanitizeWorkSchedule`. `npm test` 105/105 green; `npm run typecheck` clean; `npm run build` clean (`/admin/schedule` compiled). Unblocks 14 (reuses the collision guard).
