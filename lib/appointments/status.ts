import { toISODate } from "../availability/dates";
import type { Appointment } from "./appointment";

/**
 * The derived lifecycle state of an Appointment (CONTEXT.md). Note this is a
 * wider type than the persisted `AppointmentStatus`: "completed" exists only
 * here. An Appointment is never stored as Completed — it becomes Completed
 * automatically once its date has passed, derived by `statusOf`.
 */
export type DerivedStatus = "scheduled" | "cancelled" | "completed";

/**
 * The Appointment's Status as of `now`. Cancelled stays Cancelled. A Scheduled
 * Appointment becomes Completed once its date has passed (strictly before
 * today); on its own day and in the future it is still Scheduled.
 *
 * This single rule is also what "open" means for the one-open-per-phone
 * re-booking gate: open === `statusOf(...) === "scheduled"`.
 */
export function statusOf(
  appointment: Pick<Appointment, "status" | "date">,
  now: Date,
): DerivedStatus {
  if (appointment.status === "cancelled") {
    return "cancelled";
  }
  return appointment.date < toISODate(now) ? "completed" : "scheduled";
}

export const STATUS_LABELS: Record<DerivedStatus, string> = {
  scheduled: "Agendada",
  cancelled: "Cancelada",
  completed: "Completada",
};
