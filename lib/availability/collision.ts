import { durationOf, type Appointment } from "../appointments/appointment";
import { statusOf } from "../appointments/status";
import { visitKindOf } from "../appointments/visit-kind";
import { weekdayOf } from "./dates";
import { rangeAccepts, type TimeRange, type WorkSchedule } from "./work-schedule";

/**
 * The collision guard — shared by reducing the Work Schedule (slice 13) and
 * adding an Unavailable Day (slice 14).
 *
 * Reducing availability that would strand a booked Patient must be blocked until
 * those Appointments are cancelled (CONTEXT.md). A "collision" is a Scheduled
 * (future) Appointment that no longer fits the proposed availability. Past
 * (Completed) and Cancelled Appointments never collide — they are filtered via
 * the derived Status.
 */

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Whether [start, start + duration) lies wholly inside one of the ranges.
function withinRanges(
  time: string,
  duration: number,
  ranges: TimeRange[],
): boolean {
  const start = toMinutes(time);
  return ranges.some(
    (r) => toMinutes(r.start) <= start && start + duration <= toMinutes(r.end),
  );
}

/**
 * Whether an Appointment still fits a (proposed) Work Schedule: its whole
 * interval — start plus its duration — lies inside one worked range that still
 * accepts its Visit Kind.
 */
export function fitsSchedule(
  appointment: Pick<
    Appointment,
    | "date"
    | "time"
    | "durationMinutes"
    | "visitType"
    | "consultType"
    | "practiceType"
  >,
  schedule: WorkSchedule,
): boolean {
  const day = schedule.find((d) => d.weekday === weekdayOf(appointment.date));
  if (!day || !day.isWorkingDay) {
    return false;
  }
  const kind = visitKindOf(appointment);
  const ranges = kind
    ? day.ranges.filter((range) => rangeAccepts(range, kind))
    : day.ranges;
  return withinRanges(appointment.time, durationOf(appointment), ranges);
}

/**
 * The future Scheduled Appointments that fail a fitness predicate — the
 * collisions a reduction must clear first. The predicate dimension varies per
 * caller (a proposed Work Schedule; an added Unavailable Day).
 */
export function collidingAppointments(
  appointments: Appointment[],
  now: Date,
  fits: (appointment: Appointment) => boolean,
): Appointment[] {
  return appointments.filter(
    (appointment) =>
      statusOf(appointment, now) === "scheduled" && !fits(appointment),
  );
}

/** Collisions of a proposed Work Schedule (slice 13). */
export function collidingWithSchedule(
  appointments: Appointment[],
  proposed: WorkSchedule,
  now: Date,
): Appointment[] {
  return collidingAppointments(appointments, now, (appointment) =>
    fitsSchedule(appointment, proposed),
  );
}
