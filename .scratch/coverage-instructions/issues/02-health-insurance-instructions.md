# 02 — Indicaciones for each Health Insurance

Status: ready-for-agent
Type: AFK

## Parent

[Refactor plan: Coverage Instructions](../PRD.md), commits 1–3 and 6–8 (Health Insurance parts)

## What to build

Let the Professional write **Coverage Instructions** (UI: *Indicaciones para el paciente*) for each Health Insurance, and show them to the Patient on the cita page for Appointments booked with that insurer.

- **Format:** a single line of at most 300 characters (a named constant). A pure sanitizer in the coverage module enforces it on save: line breaks and tabs become spaces, whitespace runs collapse to one space, and the text is trimmed and capped. This guarantees the text is a valid WhatsApp template parameter later (see 04).
- **Model:** Health Insurance gains `instructions`. Stored documents without it read as empty, so there's no migration. Seeded insurers get empty Instructions. Adding, editing (including renaming) and removing an insurer carry Instructions through. Instructions are separate from **Notas**, which stays internal.
- **Admin:** the coverage editor's add and edit forms get an "Indicaciones para el paciente" single-line input with a 300-character limit and a visible counter. A hint says the text reaches the Patient (WhatsApp and cita page) while Notas stays internal. Server actions run input through the sanitizer.
- **Copied at booking:** add a pure function that resolves a chosen coverage's Instructions from the accepted Health Insurances; it returns empty for Self-Pay until 03, and for an unknown insurer. The Appointment gains an optional `coverageInstructions`, which Booking resolves and stores. Later edits to the insurer don't change existing Appointments. Legacy Appointments without the field read as empty.
- **Cita page:** while the Appointment is Scheduled and its copied Instructions aren't empty, the information section shows a callout headed with the coverage name, for example "Indicaciones para OSDE". It's hidden for Cancelled or Completed Appointments, empty Instructions, and legacy Appointments.

## Acceptance criteria

- [ ] The sanitizer is unit-tested: multi-line becomes one line, 4+ space runs collapse, over-long input is cut to 300, blank becomes empty.
- [ ] Coverage and repository tests cover Instructions through add/edit/rename/remove, and a legacy document without the field.
- [ ] The Professional can add and edit an insurer's Indicaciones in the admin, with the counter and the 300 limit. Editor tests and the snapshot are updated.
- [ ] Booking with an insurer stores its Instructions on the Appointment. Editing the insurer afterward doesn't change the stored value. This is covered by Booking tests.
- [ ] The cita page shows the Indicaciones callout only for Scheduled Appointments with non-empty Instructions. Appointment info tests and the snapshot are updated.
- [ ] Notas is never shown on any Patient-facing surface.

## Blocked by

None - can start immediately
