# 03 — Booking accepts an Appointment without an email (server side)

Status: ready-for-agent
Type: AFK

## Parent

[Refactor plan: Client updates](../PRD.md), Part C (commits 9, 10, 12)

## What to build

Make the Patient's email optional end to end on the server, so an Appointment can be booked through `POST /api/bookings` with no email.

The Appointment's and Booking Form's `patientEmail` becomes `string | null`. Booking trims the submitted email. A blank, whitespace-only or omitted value is stored as `null`. A non-blank value must pass a light check (one `@`, a non-empty local part, a domain with a dot), or Booking rejects it with a new `InvalidEmail` rejection through the existing 422 `{ rejection }` contract. Valid emails are stored trimmed.

The Confirmation and Cancellation email senders return early when the email is `null`: nothing is sent, and no email bookkeeping is written. So if Patient email notifications are turned back on (see 02), nothing ever tries to mail `null`.

The Patient's /cita page leaves out the Email row when the Appointment has no email.

There's no data migration. Existing Mongo documents keep their string emails, new ones may store `null`, and readers handle both.

## Acceptance criteria

- [ ] A booking POSTed with a blank, whitespace-only or omitted email succeeds and stores `null`.
- [ ] A booking with a valid email stores it trimmed.
- [ ] A booking with a malformed email is rejected with `InvalidEmail`, and no Appointment is created.
- [ ] Both email senders skip sending and bookkeeping when the email is `null`. Each has a test with the fake email sender.
- [ ] The /cita details component hides the Email row when there's no email. It's covered by tests, and the snapshot is updated.
- [ ] Type-checking passes, with every `patientEmail` reader handling `null` explicitly.
- [ ] Booking tests cover the cases above (Vitest, in-memory repository).

## Blocked by

None - can start immediately

## Comments

Touches the same /cita details component as 02. Running them in parallel may cause a small merge conflict, but there's no real dependency.
