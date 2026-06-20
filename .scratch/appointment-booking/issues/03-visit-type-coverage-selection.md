# 03 — Visit Type + sub-type + coverage selection & filtering

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Appointment Booking](../PRD.md)

## What to build

The conditional booking-form fields and coverage filtering. Choosing a **Visit Type**
(Consultation or Practice) reveals the required sub-type: a Consultation requires a
**Consult Type** (First Visit or Follow-up); a Practice requires a **Practice Type**
(Cryosurgery, Electrocoagulation, or Biopsy).

The coverage picker offers the accepted **Health Insurance** list (seeded) plus the one
fixed **Self-Pay** variant valid for the Visit Type — _Particular_ for a Consultation,
_Practica Particular_ for a Practice. The server validates that the chosen coverage is valid
for the Visit Type and rejects mismatches (`InvalidCoverageForVisitType`).

## Acceptance criteria

- [x] Selecting Consultation reveals a required Consult Type; selecting Practice reveals a required Practice Type.
- [x] The coverage picker lists the seeded Health Insurance plus only the Self-Pay variant matching the Visit Type.
- [x] Booking rejects a coverage option that is invalid for the chosen Visit Type (`InvalidCoverageForVisitType`).
- [x] The Appointment stores `visitType`, the relevant `consultType`/`practiceType`, and the chosen `coverage`.
- [x] Tests cover each Visit Type branch and coverage validation.

## Blocked by

- [01 — Walking skeleton](./01-walking-skeleton-booking.md)

## Comments

- 2026-06-19: Added `lib/appointments/visit-type.ts` (Visit/Consult/Practice Types + Spanish UI labels) and `lib/coverage/coverage.ts` (Coverage discriminated union, Self-Pay variants modelled explicitly, seeded insurer list, `coverageOptionsFor`, `isCoverageValidForVisitType`). `book()` evolved from returning `Appointment` to `BookingResult` (`{ ok: true; appointment } | { ok: false; rejection }`) — it now validates the required sub-type (normalizing the other away) and coverage, with rejections `MissingConsultType` / `MissingPracticeType` / `InvalidCoverageForVisitType`. Booking form gained Visit Type, conditional sub-type, and filtered coverage selects; confirmation page shows them. New `/api/health-insurances` route (seeded; slice 15 makes it DB-backed). `npm test` 22/22 green; `npm run build` clean.
- Design note: Appointment storage is flat (`visitType` + nullable `consultType`/`practiceType`) to match the prototype's data contract; `book()` guarantees consistency. The `BookingResult` union is the rejection-pattern foundation slice 05 extends with `PhoneHasOpenAppointment` / `SlotTaken` / `OutsideBookingWindow`.
