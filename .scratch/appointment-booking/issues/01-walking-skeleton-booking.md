# 01 — Walking skeleton: minimal booking → persist → confirmation

Status: ready-for-human
Type: HITL

## Parent

[PRD: Maraflamini Appointment Booking](../PRD.md)

## What to build

The first tracer bullet through the whole stack. Scaffold the **Next.js (App Router)**
app with **MongoDB** wired behind the **repository seam**, and prove one end-to-end path: a
Patient submits their identification (first name, last name, phone, email) plus a date and
time, the **Booking** module persists an Appointment through the repository, and a
confirmation page renders that Appointment by id. No validation, Availability, coverage, or
Deposit rules yet — those layer on in later slices.

Establish the reference patterns the rest of the suite reuses: the **in-memory fake** repo
adapter (tests/dev) and the **MongoDB** adapter (production) at the repository seam, plus
the test harness. There is no Patient collection — identification lives on the Appointment
(ADR-0002).

This slice is **HITL**: a human reviews the scaffold, folder layout, repository-seam shape,
and test-harness conventions before everything else is built on top of them.

## Acceptance criteria

- [x] Next.js App Router app builds; MongoDB connection configured via environment (`.env.example`). _Live POST→Mongo run still pending a `MONGODB_URI`; the Mongo adapter sits behind the seam and is covered in design but not yet exercised at runtime._
- [x] Repository seam exists with two adapters: MongoDB (production) and an in-memory fake (tests/dev).
- [x] `Booking` module exposes `book(bookingForm) → Appointment` and is the only writer of new Appointments.
- [x] Appointments persist to an `appointments` collection; no Patient collection exists.
- [x] Public booking form captures Patient identification + date + time and submits it.
- [x] On success the Patient lands on a confirmation page that renders the Appointment by id.
- [x] At least one test exercises `book()` through its interface using the in-memory fake repo (3 tests, all passing).
- [x] A human has reviewed and approved the scaffold, repository-seam shape, and test harness.

## Blocked by

None — can start immediately.

## Comments

- 2026-06-19: Scaffold built (Next.js App Router at repo root + domain/seam under `lib/`, official `mongodb` driver, vitest harness). `npm test` 3/3 green; `npm run build` clean (typecheck included). Maintainer approved the layout, repository-seam shape, and test harness as-is. Slice complete; unblocks 02–15.
