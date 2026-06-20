# 07 — Appointment Status derivation

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Appointment Booking](../PRD.md)

## What to build

The **Appointment Status** module: `statusOf(appointment, now) → Scheduled | Cancelled |
Completed`. Persisted Status is only `Scheduled` or `Cancelled`; **Completed is derived**
when a Scheduled Appointment's date has passed — never set by hand (CONTEXT.md).

The one-open-Appointment-per-phone gate reads the derived value, so an Appointment whose date
has passed (now Completed) no longer blocks the phone from booking again.

## Acceptance criteria

- [x] A Scheduled Appointment with a past date derives `Completed`.
- [x] A Scheduled Appointment with a future date stays `Scheduled`; a Cancelled one stays `Cancelled`.
- [x] "Open" for the re-booking gate means Scheduled with a future date only; a Completed (past) Appointment does not block a new booking.
- [x] No code path persists Status = Completed.
- [x] Tests cover all three derivations and the re-booking gate using the derived value.

## Blocked by

- [01 — Walking skeleton](./01-walking-skeleton-booking.md)

## Comments

- 2026-06-19: Added `lib/appointments/status.ts` — `DerivedStatus` (`scheduled` | `cancelled` | `completed`) and `statusOf(appointment, now)`: Cancelled stays Cancelled; a Scheduled Appointment becomes Completed once its date is strictly before today (own day/future stays Scheduled). "Completed" lives only in this wider derived type — the persisted `AppointmentStatus` is still `scheduled` | `cancelled`, so the type system makes persisting Completed impossible. Refactored `phoneHasOpenAppointment` to read the derived value (`statusOf(...) === "scheduled"`), replacing slice 05's interim `date >= today` rule and closing that loop; `getBookingDeps` now passes `now`. Confirmation page shows the derived Status (Spanish label). `npm test` 48/48 green; `npm run build` clean.
