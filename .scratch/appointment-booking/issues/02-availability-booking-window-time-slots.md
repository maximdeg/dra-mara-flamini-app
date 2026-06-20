# 02 — Availability: Booking Window + 20-minute Time Slots

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Appointment Booking](../PRD.md)

## What to build

The **Availability** module, exposing `bookingWindow() → Date[]` and
`availableTimesFor(date) → TimeSlot[]`, wired into the booking form's date and time pickers.

Time Slots are 20-minute intervals expanded from the (seeded default) **Work Schedule** for
that weekday, minus times already taken by Scheduled Appointments. The **Booking Window** is
tomorrow → +30 days, excluding weekends, fixed annual holidays (New Year, Christmas),
Unavailable Days (seeded empty for now), and any day with zero remaining Time Slots.
Same-day booking is never offered.

The slot expansion is carried over from the prototype as a precise decision:

```
for each time range (start_time..end_time): step by 20 minutes, emit "HH:MM";
then drop times already taken by Scheduled Appointments on that date.
```

## Acceptance criteria

- [x] `bookingWindow()` returns only dates from tomorrow through +30 days, excluding weekends, fixed holidays, Unavailable Days, and full days.
- [x] `availableTimesFor(date)` returns 20-minute Time Slots derived from the Work Schedule, minus booked Scheduled times.
- [x] Same-day booking is not offered anywhere (window starts at tomorrow).
- [x] The booking form's date picker offers only bookable days; the time picker offers only free Time Slots (driven by `/api/availability` and `/api/available-times/[date]`).
- [x] Tests cover slot expansion, each exclusion, booked-time removal, and the tomorrow/+30 boundary.

## Blocked by

- [01 — Walking skeleton](./01-walking-skeleton-booking.md)

## Comments

- 2026-06-19: Availability module added under `lib/availability/` (`bookingWindow`, `availableTimesFor`, seeded `DEFAULT_WORK_SCHEDULE`, date helpers). Repository seam grew `scheduledTimesOn(date)` in both adapters. Booking form date/time pickers now driven by the seeded Work Schedule via two API routes. `npm test` 13/13 green; `npm run build` clean. Work Schedule and Unavailable Days remain seeded — slices 13/14 make them Professional-editable. Slot-availability is enforced only in the UI for now; the server-side `SlotTaken`/`OutsideBookingWindow` Rejections come in slice 05.
