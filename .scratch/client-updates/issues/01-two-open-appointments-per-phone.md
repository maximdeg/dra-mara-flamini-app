# 01 — Two open Appointments per phone

Status: ready-for-agent
Type: AFK

## Parent

[Refactor plan: Client updates](../PRD.md), Part A (commits 1–4)

## What to build

Raise the per-phone limit from one open Appointment to **two**. "Open" keeps its current meaning: the derived Status is Scheduled (Scheduled, date not yet passed). Cancelled and Completed Appointments never count.

Booking stops asking "does this phone have an open Appointment?" and asks "is this normalized phone at its open-Appointment limit?" The cap is a named constant owned by Booking, set to 2. The Booking composition root combines the repository's Scheduled-by-phone query, the clock and the cap. Booking itself still knows nothing about the query.

The rejection is renamed from `PhoneHasOpenAppointment` to `PhoneAtOpenAppointmentLimit`. It's still returned through the existing 422 `{ rejection }` contract. The booking page shows Spanish copy that mentions the limit, interpolated from the constant so copy and rule can't drift. Example: "Este teléfono ya tiene 2 turnos agendados. Cancelá uno para reservar otro."

Follow the PRD's commit order: generalize with the cap still at 1, rename the code, raise to 2, then docs.

## Acceptance criteria

- [ ] A phone with 0 or 1 open Appointments can book.
- [ ] A phone with 2 open Appointments is rejected with `PhoneAtOpenAppointmentLimit`, and no Appointment is created.
- [ ] Past (Completed) and Cancelled Appointments don't count toward the cap.
- [ ] The cap is checked against the normalized (E.164) phone, so two spellings of one number share the cap.
- [ ] No references to `PhoneHasOpenAppointment` remain.
- [ ] The booking page shows the new Spanish message for the rejection.
- [ ] The counting and cap helpers have pure unit tests, and Booking tests cover the cases above (Vitest, in-memory repository).
- [ ] The **Patient** and **Status** entries in CONTEXT.md and ADR-0002 say "at most two open Appointments". ADR-0002 gets a short dated note that the cap was raised at the client's request.

## Blocked by

None - can start immediately
