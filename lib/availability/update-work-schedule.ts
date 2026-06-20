import type { Appointment } from "../appointments/appointment";
import type { AppointmentRepository } from "../appointments/appointment-repository";
import { collidingWithSchedule } from "./collision";
import { toISODate } from "./dates";
import type { WorkSchedule } from "./work-schedule";
import type { WorkScheduleRepository } from "./work-schedule-repository";

export type UpdateWorkScheduleResult =
  | { ok: true }
  | { ok: false; collisions: Appointment[] };

export interface UpdateWorkScheduleDependencies {
  schedule: WorkScheduleRepository;
  appointments: Pick<AppointmentRepository, "findAppointments">;
  now?: () => Date;
}

/**
 * Apply a proposed Work Schedule, guarded by the collision rule (slice 13): if
 * the change would strand any future Scheduled Appointment, it is rejected with
 * the colliding Appointments and nothing is saved. The Professional cancels
 * those (each sending a Cancellation Notice) and re-applies. A non-colliding
 * change is saved and flows into the Booking Window and Time Slots.
 */
export async function updateWorkSchedule(
  proposed: WorkSchedule,
  deps: UpdateWorkScheduleDependencies,
): Promise<UpdateWorkScheduleResult> {
  const now = (deps.now ?? (() => new Date()))();
  const futureScheduled = await deps.appointments.findAppointments({
    from: toISODate(now),
    status: "scheduled",
  });

  const collisions = collidingWithSchedule(futureScheduled, proposed, now);
  if (collisions.length > 0) {
    return { ok: false, collisions };
  }

  await deps.schedule.save(proposed);
  return { ok: true };
}
