# 03 — Indicaciones for the two Self-Pay variants

Status: ready-for-agent
Type: AFK

## Parent

[Refactor plan: Coverage Instructions](../PRD.md), commit 4 and the Self-Pay parts of commits 6–8

## What to build

Extend **Coverage Instructions** to the two fixed Self-Pay variants, Particular and Practica Particular, so a Self-Pay Patient also sees their coverage's Indicaciones on the cita page.

The persisted Self-Pay settings (prices today) gain one Instructions field per variant. Missing fields read as empty, so there's no migration. The coverage editor's Self-Pay section gets the same "Indicaciones para el paciente" input, counter and 300 limit next to each variant's price, sanitized on save with the sanitizer from 02. The Instructions resolver from 02 now returns the matching variant's Instructions for a Self-Pay coverage. Booking passes it the Self-Pay settings it already receives, so Self-Pay bookings copy their Instructions onto the Appointment and the cita page callout from 02 shows them. The heading uses the Self-Pay label, for example "Indicaciones para Particular".

## Acceptance criteria

- [ ] The Self-Pay settings repository returns empty Instructions for a legacy document, and saved Instructions otherwise. This is covered by repository tests.
- [ ] The Professional can edit each variant's Indicaciones in the admin with the counter and the 300 limit. Editor tests and the snapshot are updated.
- [ ] Resolver unit tests cover both Self-Pay variants.
- [ ] A Self-Pay booking stores its variant's Instructions on the Appointment. This is covered by Booking tests.
- [ ] The cita page shows the callout for a Scheduled Self-Pay Appointment with non-empty Instructions.

## Blocked by

- [02 — Indicaciones for each Health Insurance](02-health-insurance-instructions.md)
