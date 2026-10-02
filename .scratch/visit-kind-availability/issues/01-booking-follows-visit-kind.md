# 01 — Booking follows the chosen Visit Kind

Status: ready-for-agent
Type: AFK

## Parent

[Refactor plan: availability and duration per Visit Kind](../PRD.md), commits 1, 8 (kind plumbing), 9, 10

## What to build

Make the whole booking path aware of what is being booked, without changing which times are offered yet.

- **Visit Kind:** the five bookable combinations of Visit Type and sub-type (Consulta · Primera vez, Consulta · Seguimiento, Práctica · Criocirugía, Práctica · Electrocoagulación, Práctica · Biopsia). It comes with Spanish labels "<Tipo de visita> · <sub-type>", a Consulta/Práctica grouping, and a pure function deriving the kind from an Appointment or Booking Form. It's never stored separately.
- **Availability takes the kind:** the free times for a date, the Booking Window and the date/time classification all accept a Visit Kind. In this slice every range accepts every kind, so the results are the same for all kinds; slice 02 makes them differ.
- **Endpoints:** the public availability and available-times endpoints require a `kind` parameter and return 400 for a missing or unknown kind.
- **Booking:** Booking derives the kind from the form and passes it into classification.
- **Booking form:** Fecha and Hora stay disabled until Visit Type and its sub-type are chosen. The form then fetches dates and times with the kind, and changing the kind clears date and time and refetches.

Add **Visit Kind** to CONTEXT.md.

## Acceptance criteria

- [ ] Unit tests map every Visit Type and sub-type combination to its Visit Kind and label.
- [ ] Both availability endpoints return 400 without a valid `kind`, and the same dates and times as before with one.
- [ ] Booking passes the derived kind to classification. This is covered by Booking tests through the injected dependency.
- [ ] Booking page tests: Fecha is disabled until the kind is complete; dates are fetched with the kind; changing the kind resets date and time. The snapshot is updated and the booking-form e2e screenshots are regenerated.
- [ ] The full booking flow still works end to end.
- [ ] CONTEXT.md defines Visit Kind.

## Blocked by

None - can start immediately
