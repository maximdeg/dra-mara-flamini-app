# 11 — Calendar view of Appointments by day

Status: ready-for-agent
Type: AFK

## Parent

[PRD: Maraflamini Appointment Booking](../PRD.md)

## What to build

A calendar/month view for the Professional showing Appointments by day, with per-day detail.
A month grid summarises each day (e.g. Appointment counts); selecting a day shows that day's
Appointments. The view reflects the derived Status.

## Acceptance criteria

- [x] A month grid shows days with an Appointment count/summary.
- [x] Selecting a day shows that day's Appointments.
- [x] The view reflects the derived Appointment Status.
- [x] Tests/integration cover rendering from repository data.

## Blocked by

- [09 — Professional authentication + admin shell](./09-professional-auth-admin-shell.md)

## Comments

- 2026-06-20: Built on the slice-10 listing seam (the deepening's payoff: a second caller crossing the same interface). New pure module `lib/appointments/calendar.ts` — `monthBounds(year, month)` (the inclusive ISO range to query) and `buildMonthCalendar(year, month, views)`, which arranges the month's `AppointmentView`s into a Monday-start grid of whole weeks (`CalendarDay` carries date, `inMonth`, the day's views, and count). It does no I/O and derives no Status — the views arrive Status-derived from `listAppointments`, so the grid just reflects it. UI: guarded `/admin/calendar` fetches the month via `listAppointments({ from, to })`, drops Cancelled (a calendar is a workload view — cancelled Appointments freed their slot), builds the grid, and renders a month table with per-day count badges, prev/next month nav, today highlight, and clickable days; `?day=YYYY-MM-DD` shows that day's Appointments with time, Patient, Visit Type, and derived Status label. Dashboard links to it. Tests (5 new): `monthBounds`; grid shape for a Monday-1st month (June 2026) and a mid-week-1st month (July 2026 → grid starts Mon Jun 29); per-day grouping + counts; and that each day's views surface their derived Status (completed vs. scheduled). `npm test` 86/86 green; `npm run typecheck` clean; `npm run build` clean (`/admin/calendar` compiled). Same runtime caveat as 01/09/10: the live Mongo read needs `MONGODB_URI` + data.
