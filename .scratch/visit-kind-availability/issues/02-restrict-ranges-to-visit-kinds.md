# 02 — Restrict Horarios ranges to Visit Kinds

Status: ready-for-agent
Type: AFK

## Parent

[Refactor plan: availability and duration per Visit Kind](../PRD.md), commits 2, 11 (kind part), 12

## What to build

Let the Professional say which Visit Kinds each time range of the Work Schedule accepts, and have booking respect it.

- **Model:** a time range gains an optional list of accepted Visit Kinds. A missing list means all kinds, so stored schedules keep working with no migration. The Work Schedule sanitizer keeps only known kinds, drops duplicates, and keeps a range only if it accepts at least one kind.
- **Availability:** a date's free times for a kind come only from ranges that accept that kind. The Booking Window for a kind skips days where no accepting range has a free time.
- **Collisions:** a Scheduled Appointment fits a proposed schedule only if its time falls in a range that accepts its kind. Unticking a kind under booked Appointments triggers the existing cancel-first dialog.
- **Horarios editor:** each range shows grouped checkboxes: Consulta (Primera vez, Seguimiento) and Práctica (Criocirugía, Electrocoagulación, Biopsia), each group with a toggle that selects it all. A range with every kind ticked collapses to "Todas". A range must accept at least one kind to be saved.

Update CONTEXT.md: **Work Schedule** ranges accept specific Visit Kinds, and the **Booking Window** is per kind.

## Acceptance criteria

- [ ] Sanitizer and reader tests cover legacy ranges (all kinds), unknown kinds, duplicates, and an empty list (range dropped).
- [ ] Availability tests: a kind excluded from a range gets no times there; the Booking Window differs per kind.
- [ ] Collision tests: removing a kind from a range collides with a Scheduled Appointment of that kind. Past and Cancelled Appointments never collide.
- [ ] The Horarios editor shows the grouped checkboxes, the group toggles and the "Todas" collapse; it saves tags and blocks a range with no kinds. Tests and the snapshot are updated.
- [ ] End to end: unticking Biopsia on Mondays removes Mondays from the booking form for Biopsia only.

## Blocked by

- [01 — Booking follows the chosen Visit Kind](01-booking-follows-visit-kind.md)

## Comments

Shares availability and collision code with 03. Running them in parallel may cause merge conflicts.
