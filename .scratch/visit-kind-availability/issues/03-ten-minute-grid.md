# 03 — 10-minute start-time grid

Status: ready-for-agent
Type: AFK

## Parent

[Refactor plan: availability and duration per Visit Kind](../PRD.md), commits 3, 6, 7, 11 (interval part)

## What to build

Move availability from fixed 20-minute slots to a 10-minute grid of start times, with overlap checked against each booked Appointment's full time span. This lays the groundwork for per-kind durations (04). In this slice every Appointment still lasts 20 minutes.

- **Booked intervals:** add a repository method returning each Scheduled Appointment's start and duration on a date, with legacy and current Appointments as 20 minutes. It replaces the times-only method once availability uses it.
- **Start times:** a start is offered every 10 minutes when start plus 20 minutes fits inside one range (touching ranges never combine) and the interval overlaps no booked interval. Ranges already stored off-grid step from their own start.
- **Grid on edits:** the sanitizer used for Work Schedule edits drops range ends that aren't on a 10-minute boundary. The Horarios time inputs step by 10.
- **Collisions:** an Appointment fits when its whole interval lies inside one range.

**Visible change:** Patients can now pick starts like 09:10 and 09:30, not only :00/:20/:40. This is intended.

Update CONTEXT.md: **Time Slot** becomes a bookable start time on a 10-minute grid.

## Acceptance criteria

- [ ] Repository tests cover booked intervals (both adapters), with legacy Appointments as 20 minutes.
- [ ] Availability tests:
  - [ ] starts are offered every 10 minutes;
  - [ ] no start is offered within 20 minutes of a range end;
  - [ ] a booked Appointment blocks overlapping starts (e.g. 09:00 blocks 08:50 and 09:10);
  - [ ] touching ranges don't combine;
  - [ ] off-grid legacy ranges step from their own start.
- [ ] Sanitizer tests: 09:00–13:00 is kept, 09:05–13:00 is dropped on edit. The editor's time inputs step by 10.
- [ ] Collision tests work on intervals.
- [ ] The booking form offers 10-minute starts. Booking still refuses a start taken since the form loaded (`SlotTaken`).
- [ ] CONTEXT.md redefines Time Slot.

## Blocked by

- [01 — Booking follows the chosen Visit Kind](01-booking-follows-visit-kind.md)

## Comments

Shares availability and collision code with 02. Running them in parallel may cause merge conflicts.
