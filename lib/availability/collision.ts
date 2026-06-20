import type { Appointment } from "../appointments/appointment";
import { statusOf } from "../appointments/status";
import { weekdayOf } from "./dates";
import type { TimeRange, WorkSchedule } from "./work-schedule";

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

function withinRanges(time: string, ranges: TimeRange[]): boolean {
  const t = toMinutes(time);
  return ranges.some((r) => toMinutes(r.start) <= t && t < toMinutes(r.end));
}

/** Whether an Appointment's date+time still fits a (proposed) Work Schedule. */
export function fitsSchedule(
  appointment: Pick<Appointment, "date" | "time">,
  schedule: WorkSchedule,
): boolean {
  const day = schedule.find((d) => d.weekday === weekdayOf(appointment.date));
  if (!day || !day.isWorkingDay) {
    return false;
  }
  return withinRanges(appointment.time, day.ranges);
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
