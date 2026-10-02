import type { Appointment } from "./appointment";
import { statusOf } from "./status";

/**
 * How many open Appointments one phone number may hold at a time (ADR-0002).
 * Kept free of server-only imports so the booking form can quote it in the
 * rejection message without the copy and the rule drifting apart.
 */
export const MAX_OPEN_APPOINTMENTS_PER_PHONE = 2;

/**
 * How many of a phone's Scheduled Appointments are still open. "Open" is the
 * derived Status being Scheduled — so a past (now Completed) Appointment does
 * not count against the phone.
 */
export function countOpenAppointments(
  scheduled: Appointment[],
  now: Date,
): number {
  return scheduled.filter(
    (appointment) => statusOf(appointment, now) === "scheduled",
  ).length;
}

/** Whether a phone already holds the maximum number of open Appointments. */
export function isAtOpenAppointmentLimit(
  scheduled: Appointment[],
  now: Date,
): boolean {
  return (
    countOpenAppointments(scheduled, now) >= MAX_OPEN_APPOINTMENTS_PER_PHONE
  );
}
