import {
  addDays,
  isFixedHoliday,
  isWeekend,
  toISODate,
  weekdayOf,
} from "./dates";
import { DEFAULT_DURATION_MINUTES } from "../appointments/appointment";
import type { BookedInterval } from "../appointments/appointment-repository";
import type { VisitKind } from "../appointments/visit-kind";
import {
  rangeAccepts,
  type TimeRange,
  type WorkSchedule,
  type WorkdaySchedule,
} from "./work-schedule";

/**
 * Availability works on a 10-minute grid: a start is offered every
 * GRID_MINUTES within a range, wherever the whole Appointment fits.
 */
export const GRID_MINUTES = 10;

/** The Booking Window opens tomorrow and runs this many days ahead. */
export const BOOKING_WINDOW_DAYS = 30;

/**
 * Everything Availability needs, accepted as dependencies (not created) so the
 * module is tested through its interface: a Work Schedule, the set of
 * Unavailable Days, a way to read the intervals Scheduled Appointments occupy
 * on a date (the repository seam), and an injectable clock.
 */
export interface AvailabilityDependencies {
  workSchedule: WorkSchedule;
  unavailableDays: Iterable<string>;
  scheduledIntervalsOn: (
    date: string,
  ) => Promise<BookedInterval[]> | BookedInterval[];
  now?: () => Date;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Every start in a range, stepping GRID_MINUTES from the range's own start,
// where an Appointment of `duration` minutes ends by the range's end — it
// never runs into a touching range.
function startsWithin(range: TimeRange, duration: number): number[] {
  const starts: number[] = [];
  const end = toMinutes(range.end);
  for (
    let cur = toMinutes(range.start);
    cur + duration <= end;
    cur += GRID_MINUTES
  ) {
    starts.push(cur);
  }
  return starts;
}

// Whether [start, start + duration) overlaps any booked interval.
function overlapsBooked(
  start: number,
  duration: number,
  booked: BookedInterval[],
): boolean {
  return booked.some((b) => {
    const bookedStart = toMinutes(b.time);
    return (
      start < bookedStart + b.durationMinutes && bookedStart < start + duration
    );
  });
}

// The ranges of a worked day that can be booked for a Visit Kind.
function rangesFor(day: WorkdaySchedule, kind: VisitKind): TimeRange[] {
  return day.ranges.filter((range) => rangeAccepts(range, kind));
}

function isExcludedDay(date: string, unavailable: Set<string>): boolean {
  return isWeekend(date) || isFixedHoliday(date) || unavailable.has(date);
}

/**
 * The free Time Slots — bookable start times — on a date for the Visit Kind
 * being booked: every 10-minute start in a range accepting the kind where the
 * whole Appointment fits the range, minus starts that would overlap a Scheduled
 * Appointment (of any kind — one Professional, one agenda).
 * Returns [] for any non-bookable day (weekend, fixed holiday, Unavailable Day,
 * or a non-working weekday) and for a day with no range accepting the kind.
 */
export async function availableTimesFor(
  date: string,
  kind: VisitKind,
  deps: AvailabilityDependencies,
): Promise<string[]> {
  const unavailable = new Set(deps.unavailableDays);
  if (isExcludedDay(date, unavailable)) {
    return [];
  }

  const day = deps.workSchedule.find((d) => d.weekday === weekdayOf(date));
  if (!day || !day.isWorkingDay) {
    return [];
  }

  const duration = DEFAULT_DURATION_MINUTES;
  const booked = await deps.scheduledIntervalsOn(date);
  return rangesFor(day, kind)
    .flatMap((range) => startsWithin(range, duration))
    .filter((start) => !overlapsBooked(start, duration, booked))
    .map(toTime);
}

/**
 * The Booking Window for a Visit Kind: the dates open for booking it — from
 * tomorrow through 30 days ahead (same-day booking is not allowed), excluding
 * weekends, fixed holidays, Unavailable Days, and any day with no remaining
 * Time Slots for that kind.
 */
export async function bookingWindow(
  kind: VisitKind,
  deps: AvailabilityDependencies,
): Promise<string[]> {
  const today = toISODate((deps.now ?? (() => new Date()))());
  const open: string[] = [];

  for (let offset = 1; offset <= BOOKING_WINDOW_DAYS; offset += 1) {
    const date = addDays(today, offset);
    const times = await availableTimesFor(date, kind, deps);
    if (times.length > 0) {
      open.push(date);
    }
  }

  return open;
}

/** Whether a chosen date/time can be booked, and if not, why. */
export type BookingDateTimeStatus = "ok" | "outside-window" | "slot-taken";

/**
 * Classify a chosen date/time for Booking's server-side guard. A date outside
 * the Booking Window (past/same-day, beyond 30 days, weekend, fixed holiday,
 * Unavailable Day, a non-working weekday, or a day with no range accepting the
 * kind) is "outside-window". A bookable
 * day whose specific time is no longer free is "slot-taken" — the race between
 * loading the form and submitting it — or a time not offered for this kind.
 */
export async function classifyBookingDateTime(
  date: string,
  time: string,
  kind: VisitKind,
  deps: AvailabilityDependencies,
): Promise<BookingDateTimeStatus> {
  const today = toISODate((deps.now ?? (() => new Date()))());
  if (date < addDays(today, 1) || date > addDays(today, BOOKING_WINDOW_DAYS)) {
    return "outside-window";
  }

  const day = deps.workSchedule.find((d) => d.weekday === weekdayOf(date));
  const structurallyBookable =
    !isExcludedDay(date, new Set(deps.unavailableDays)) &&
    day !== undefined &&
    day.isWorkingDay &&
    rangesFor(day, kind).length > 0;
  if (!structurallyBookable) {
    return "outside-window";
  }

  const times = await availableTimesFor(date, kind, deps);
  return times.includes(time) ? "ok" : "slot-taken";
}
