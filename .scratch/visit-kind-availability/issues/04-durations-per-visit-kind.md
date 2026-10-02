# 04 — Durations per Visit Kind

Status: ready-for-agent
Type: AFK

## Parent

[Refactor plan: availability and duration per Visit Kind](../PRD.md), commits 4, 5, 11 (duration part), 13, 14, 15

## What to build

Let the Professional set how long each Visit Kind takes, and have booking, availability and the admin use it.

- **Visit Durations:** one value per Visit Kind, a multiple of 10 between 10 and 120 minutes, defaulting to 20. A sanitizer and its own settings repository (in-memory and Mongo) are added; missing settings read as 20 for every kind.
- **Copied at booking:** the Appointment gains an optional `durationMinutes`, copied from the booked kind's duration. Missing means 20 (legacy). Later duration edits never move or collide with existing Appointments.
- **Availability:** start times for a kind use that kind's duration, so a 40-minute Biopsia isn't offered within 40 minutes of a range end. Booked intervals use each Appointment's copied duration. The endpoints look up the duration server-side, never from the client.
- **Collisions:** an Appointment's whole interval, using its copied duration, must fit inside one range that accepts its kind.
- **Horarios page:** a durations table above the weekly schedule has one row per Visit Kind and a picker (10–120, step 10). It saves through a sanitizing server action with a success toast, and a hint says existing Appointments keep their duration.
- **Admin:** the appointments list and calendar day view show "HH:MM–HH:MM".

Docs: CONTEXT.md gains **Visit Duration**. A new ADR records the 10-minute grid, every-10-minutes starts, the one-range rule, the shared agenda across kinds, and copying the duration at booking.

## Acceptance criteria

- [ ] Sanitizer and repository tests cover Visit Durations, including legacy or empty documents.
- [ ] Booking tests: the booked kind's duration is copied, and a later edit doesn't change it.
- [ ] Availability tests: a 40-minute kind isn't offered within 40 minutes of a range end; a booked 40-minute Appointment blocks every overlapping start for all kinds.
- [ ] Collision tests: shortening a range so a 40-minute Appointment would overrun collides.
- [ ] The durations table saves through the action. Editor tests and the snapshot are updated.
- [ ] The admin list and calendar show end times from each Appointment's copied duration. Tests and snapshots are updated.
- [ ] CONTEXT.md and the new ADR are written.

## Blocked by

- [02 — Restrict Horarios ranges to Visit Kinds](02-restrict-ranges-to-visit-kinds.md)
- [03 — 10-minute start-time grid](03-ten-minute-grid.md)
