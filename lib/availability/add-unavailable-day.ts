import type { Appointment } from "../appointments/appointment";
import type { AppointmentRepository } from "../appointments/appointment-repository";
import { collidingAppointments } from "./collision";
import { toISODate } from "./dates";
import type { UnavailableDaysRepository } from "./unavailable-days-repository";

export type AddUnavailableDayResult =
  | { ok: true }
  | { ok: false; collisions: Appointment[] };

export interface AddUnavailableDayDependencies {
  unavailableDays: Pick<UnavailableDaysRepository, "add">;
  appointments: Pick<AppointmentRepository, "findAppointments">;
  now?: () => Date;
}

/**
 * Block a date, guarded by the same collision rule as a Work Schedule reduction
 * (slice 13's `collidingAppointments`): if any future Scheduled Appointment
 * falls on that date, the add is rejected with those Appointments and nothing is
 * saved. The Professional cancels them (each sending a Cancellation Notice) and
 * re-adds. Removing an Unavailable Day only reopens a date, so it needs no
 * guard. An added day is then excluded from the Booking Window via Availability.
 */
export async function addUnavailableDay(
  date: string,
  deps: AddUnavailableDayDependencies,
): Promise<AddUnavailableDayResult> {
  const now = (deps.now ?? (() => new Date()))();
  const futureScheduled = await deps.appointments.findAppointments({
    from: toISODate(now),
    status: "scheduled",
  });

  // Once the date is blocked, an Appointment on it no longer fits.
  const collisions = collidingAppointments(
    futureScheduled,
    now,
    (appointment) => appointment.date !== date,
  );
  if (collisions.length > 0) {
    return { ok: false, collisions };
  }

  await deps.unavailableDays.add(date);
  return { ok: true };
}
