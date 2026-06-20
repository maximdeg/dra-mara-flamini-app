import { addDays, isFixedHoliday, isWeekend, toISODate, weekdayOf } from "./dates";
import type { TimeRange, WorkSchedule } from "./work-schedule";

/** A Time Slot is a 20-minute bookable interval. */
export const SLOT_MINUTES = 20;

/** The Booking Window opens tomorrow and runs this many days ahead. */
export const BOOKING_WINDOW_DAYS = 30;

/**
 * Everything Availability needs, accepted as dependencies (not created) so the
 * module is tested through its interface: a Work Schedule, the set of
 * Unavailable Days, a way to read times already taken by Scheduled Appointments
 * on a date (the repository seam), and an injectable clock.
 */
export interface AvailabilityDependencies {
  workSchedule: WorkSchedule;
  unavailableDays: Iterable<string>;
  scheduledTimesOn: (date: string) => Promise<string[]> | string[];
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

// Expand a worked range into 20-minute Time Slots (end exclusive). Carried over
// from the prototype's generateTimeSlots(): step by SLOT_MINUTES from start
// until the end is reached.
function expandRange(range: TimeRange): string[] {
  const slots: string[] = [];
  const end = toMinutes(range.end);
  for (let cur = toMinutes(range.start); cur < end; cur += SLOT_MINUTES) {
    slots.push(toTime(cur));
  }
  return slots;
}

function isExcludedDay(date: string, unavailable: Set<string>): boolean {
  return isWeekend(date) || isFixedHoliday(date) || unavailable.has(date);
}

/**
 * The free 20-minute Time Slots for a date: every slot derived from that
 * weekday's Work Schedule, minus times already taken by Scheduled Appointments.
 * Returns [] for any non-bookable day (weekend, fixed holiday, Unavailable Day,
 * or a non-working weekday).
 */
export async function availableTimesFor(
  date: string,
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

  const all = day.ranges.flatMap(expandRange);
  const taken = new Set(await deps.scheduledTimesOn(date));
  return all.filter((time) => !taken.has(time));
}

/**
 * The Booking Window: the dates open for booking — from tomorrow through 30
 * days ahead (same-day booking is not allowed), excluding weekends, fixed
 * holidays, Unavailable Days, and any day with no remaining Time Slots.
 */
export async function bookingWindow(
  deps: AvailabilityDependencies,
): Promise<string[]> {
  const today = toISODate((deps.now ?? (() => new Date()))());
  const open: string[] = [];

  for (let offset = 1; offset <= BOOKING_WINDOW_DAYS; offset += 1) {
    const date = addDays(today, offset);
    const times = await availableTimesFor(date, deps);
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
 * Unavailable Day, or a non-working weekday) is "outside-window". A bookable
 * day whose specific time is no longer free is "slot-taken" — the race between
 * loading the form and submitting it.
 */
export async function classifyBookingDateTime(
  date: string,
  time: string,
  deps: AvailabilityDependencies,
): Promise<BookingDateTimeStatus> {
  const today = toISODate((deps.now ?? (() => new Date()))());
  if (date < addDays(today, 1) || date > addDays(today, BOOKING_WINDOW_DAYS)) {
    return "outside-window";
  }

  const day = deps.workSchedule.find((d) => d.weekday === weekdayOf(date));
  const structurallyBookable =
    !isExcludedDay(date, new Set(deps.unavailableDays)) &&
    Boolean(day?.isWorkingDay);
  if (!structurallyBookable) {
    return "outside-window";
  }

  const times = await availableTimesFor(date, deps);
  return times.includes(time) ? "ok" : "slot-taken";
}
