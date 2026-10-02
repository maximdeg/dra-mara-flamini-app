# 04 — Booking form makes email optional

Status: ready-for-agent
Type: AFK

## Parent

[Refactor plan: Client updates](../PRD.md), Part C (commits 11, 14)

## What to build

Let a Patient leave the email blank on the booking form. The field is no longer required and is labelled as optional, for example "Email (opcional)". It keeps `type="email"` as a browser hint only. A blank value is submitted as is, so Booking normalizes it (see 03). When Booking rejects a malformed email, the form shows a Spanish message for `InvalidEmail`, for example "Revisá el email ingresado o dejalo vacío."

Update the domain docs: the **Patient** entry in CONTEXT.md and the list of identification fields in ADR-0002 now say email is optional.

## Acceptance criteria

- [ ] The booking form can be submitted with the email blank, and an Appointment is created.
- [ ] The email field is visibly labelled as optional and has no `required` attribute.
- [ ] An `InvalidEmail` rejection shows its Spanish message on the form.
- [ ] The booking page test and its snapshot are updated.
- [ ] The public e2e visual snapshots of the booking form are regenerated in the same commit, and the commit message says so.
- [ ] CONTEXT.md and ADR-0002 describe email as optional.

## Blocked by

- [03 — Booking accepts an Appointment without an email](03-booking-without-email.md)
