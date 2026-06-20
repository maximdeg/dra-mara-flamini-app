# 14 — Unavailable Days CRUD

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Appointment Booking](../PRD.md)

## What to build

The Professional adds and removes **Unavailable Days** — one-off blocked dates that fall on a
working weekday, making them non-bookable. An added Unavailable Day is excluded from the
Booking Window. Adding one that collides with existing Scheduled Appointments follows the
same collision-requires-cancellation guard introduced in slice 13.

## Acceptance criteria

- [x] The Professional can add and remove Unavailable Days.
- [x] An added Unavailable Day is excluded from the Booking Window.
- [x] Adding an Unavailable Day that collides with Scheduled Appointments requires cancelling them first (each enqueuing a Cancellation Notice).
- [x] Tests cover add/remove and the Booking Window effect.

## Blocked by

- [09 — Professional authentication + admin shell](./09-professional-auth-admin-shell.md)
- Reuses the collision guard from [13 — Work Schedule management](./13-work-schedule-management.md) for the colliding-add case.

## Comments

- 2026-06-20: Unavailable Days are now persisted and Professional-managed, mirroring the slice-13 Work Schedule pattern. New **Unavailable Days seam** (`lib/availability/unavailable-days-repository.ts`): `list()`/`add()`/`remove()`, with Mongo (one doc per date, idempotent upsert on `add`) + in-memory adapters and a composition root. `getAvailabilityDeps` now reads `list()` (replacing the empty seeded constant), so a blocked date is excluded from the Booking Window and its Time Slots — Availability already honored `unavailableDays`, so the wiring is all it took. The colliding-add case **reuses slice 13's shared guard**: `addUnavailableDay(date, deps)` fetches future Scheduled via `findAppointments({ from: today, status: scheduled })` and runs `collidingAppointments(..., a => a.date !== date)` — any future Scheduled Appointment on the target date collides; the add is rejected with those Appointments and nothing is saved. Removing a day needs no guard (it only reopens a date). `isISODate` added to `dates.ts` as the input validator. UI: guarded `/admin/unavailable-days` — a client manager listing blocked dates with Quitar buttons and a date picker to add; on collision it lists the conflicting turnos with per-turn Cancelar buttons (Professional cancel → Cancellation Notice), then the Professional re-adds. Dashboard links to it. Tests (7 new): `addUnavailableDay` (blocks a date with a Scheduled Appointment + saves nothing, persists a free date, applies after the collider is cancelled), a `bookingWindow`/`availableTimesFor` exclusion test for an added day, and the seam round-trip (add/list ascending, idempotent add, remove). `npm test` 112/112 green; `npm run typecheck` clean; `npm run build` clean (`/admin/unavailable-days` compiled).
