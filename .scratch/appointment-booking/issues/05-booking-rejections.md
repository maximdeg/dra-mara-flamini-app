# 05 — Booking Rejections (server-side, typed)

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Appointment Booking](../PRD.md)

## What to build

The server-side guard rails that turn `book()` into the only safe path to a new Appointment.
Booking returns typed Rejections and creates no Appointment row when one fires:

- `PhoneHasOpenAppointment` — the phone number already holds an **open** Appointment
  (Scheduled with a future date). Enforced server-side at booking time, not via a uniqueness
  column (there is no Patient row — ADR-0002).
- `SlotTaken` — the chosen Time Slot was taken between form load and submit.
- `OutsideBookingWindow` — the chosen date/time is not within the Booking Window.

Each Rejection is surfaced clearly in the booking UI.

## Acceptance criteria

- [x] Booking by a phone that already has an open Appointment is rejected server-side (`PhoneHasOpenAppointment`).
- [x] Booking a Time Slot already taken is rejected (`SlotTaken`).
- [x] Booking a date/time outside the Booking Window is rejected (`OutsideBookingWindow`).
- [x] Each Rejection is a distinct typed result, surfaced in the UI, and creates no Appointment.
- [x] Tests cover each rejection path through `book()`.

## Blocked by

- [01 — Walking skeleton](./01-walking-skeleton-booking.md)
- [02 — Availability](./02-availability-booking-window-time-slots.md)

## Comments

- 2026-06-19: Added `classifyBookingDateTime` to Availability (`ok` / `outside-window` / `slot-taken`) and `findScheduledByPhone` to the repository seam (both adapters). `book()` gained `PhoneHasOpenAppointment` / `OutsideBookingWindow` / `SlotTaken`, enforced via two injected predicates (`classifyDateTime`, `hasOpenAppointmentForPhone`) so Booking stays a pure orchestrator; a new `getBookingDeps` composition root wires them from Availability + the repository + today's date, and the route handler is now a thin `book(form, await getBookingDeps())`. Booking form maps each rejection to a Spanish message and refreshes the slot list on `SlotTaken`. `npm test` 40/40 green; `npm run build` clean.
- Notes: "open" is the interim date rule `date >= today` in the pure `phoneHasOpenAppointment` helper — slice 07 re-expresses it via the derived Appointment Status. A residual TOCTOU race remains between the `SlotTaken` check and `create`; acceptable at this volume, would be hardened later with a unique index/transaction.
