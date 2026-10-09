import {
  addDays,
  isFixedHoliday,
  isWeekend,
  toISODate,
  weekdayOf,
} from "./dates";
import type { BookedInterval } from "../appointments/appointment-repository";
import type { VisitKind } from "../appointments/visit-kind";
import type { VisitDurations } from "./visit-durations";
import { DEFAULT_BOOKING_WINDOW_DAYS } from "./booking-window-length";
import {
  rangeAccepts,
  type TimeRange,
  type WorkSchedule,
  type WorkdaySchedule,
} from "./work-schedule";

/**
 * Everything Availability needs, accepted as dependencies (not created) so the
 * module is tested through its interface: a Work Schedule, the set of
 * Unavailable Days, a way to read the intervals Scheduled Appointments occupy
 * on a date (the repository seam), each Visit Kind's duration, how many days
 * ahead the Booking Window runs (the Professional's setting), and an
 * injectable clock.
 */
export interface AvailabilityDependencies {
  workSchedule: WorkSchedule;
  unavailableDays: Iterable<string>;
  scheduledIntervalsOn: (
    date: string,
  ) => Promise<BookedInterval[]> | BookedInterval[];
  /** How long each Visit Kind takes — what a start must leave room for. */
  visitDurations: VisitDurations;
  /** How many days ahead the Booking Window runs; 30 when not given. */
  bookingWindowDays?: number;
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

// The back-to-back starts in a range for an Appointment of `duration`
// minutes: from the range's own start, each start follows the previous
// Appointment's end, and a start that would overlap a booked interval moves to
// where that booking ends — so the agenda fills without gaps. Every
// Appointment ends by the range's end; it never runs into a touching range.
function startsWithin(
  range: TimeRange,
  duration: number,
  booked: BookedInterval[],
): number[] {
  const starts: number[] = [];
  const end = toMinutes(range.end);
  let cur = toMinutes(range.start);
  while (cur + duration <= end) {
    const overlappingEnds = booked
      .map((b) => ({
        start: toMinutes(b.time),
        end: toMinutes(b.time) + b.durationMinutes,
      }))
      .filter((b) => cur < b.end && b.start < cur + duration)
      .map((b) => b.end);
    if (overlappingEnds.length > 0) {
      cur = Math.max(...overlappingEnds);
    } else {
      starts.push(cur);
      cur += duration;
    }
  }
  return starts;
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
 * being booked: back-to-back starts, one Visit Duration apart, in each range
 * accepting the kind, where the whole Appointment fits the range. A Scheduled
 * Appointment (of any kind — one Professional, one agenda) is stepped around:
 * the next start is where it ends.
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

  const duration = deps.visitDurations[kind];
  const booked = await deps.scheduledIntervalsOn(date);
  return rangesFor(day, kind)
    .flatMap((range) => startsWithin(range, duration, booked))
    .map(toTime);
}

/**
 * The Booking Window for a Visit Kind: the dates open for booking it — from
 * tomorrow through the Booking Window length ahead (30 days unless the
 * Professional sets another; same-day booking is not allowed), excluding
 * weekends, fixed holidays, Unavailable Days, and any day with no remaining
 * Time Slots for that kind.
 */
export async function bookingWindow(
  kind: VisitKind,
  deps: AvailabilityDependencies,
): Promise<string[]> {
  const today = toISODate((deps.now ?? (() => new Date()))());
  const open: string[] = [];

  const length = deps.bookingWindowDays ?? DEFAULT_BOOKING_WINDOW_DAYS;
  for (let offset = 1; offset <= length; offset += 1) {
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
 * the Booking Window (past/same-day, beyond its length, weekend, fixed holiday,
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
  const length = deps.bookingWindowDays ?? DEFAULT_BOOKING_WINDOW_DAYS;
  if (date < addDays(today, 1) || date > addDays(today, length)) {
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
