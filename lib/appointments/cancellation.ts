import type { Appointment } from "./appointment";
import type { AppointmentRepository } from "./appointment-repository";
import { statusOf } from "./status";

/** Who is cancelling. Determines whether the Cancellation Window applies. */
export type CancellationActor = "patient" | "professional";

export type CancellationRejection =
  | "NotFound"
  | "AlreadyCancelled"
  | "AlreadyCompleted"
  | "OutsideCancellationWindow";

export type CancellationResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; rejection: CancellationRejection };

export interface CancellationDependencies {
  repository: AppointmentRepository;
  notifyCancellation: (appointment: Appointment) => Promise<void> | void;
  /**
   * Send the Cancellation email (called best-effort). Receives the actor so the
   * copy can acknowledge a Patient self-cancel or apologise for a clinic one.
   */
  sendCancellationEmail: (
    appointment: Appointment,
    actor: CancellationActor,
  ) => Promise<void> | void;
  now?: () => Date;
}

/** A Patient may cancel only more than this many hours before the start time. */
export const CANCELLATION_WINDOW_HOURS = 24;

/** The Appointment's start as a local Date. */
export function startOf(appointment: Pick<Appointment, "date" | "time">): Date {
  return new Date(`${appointment.date}T${appointment.time}:00`);
}

/**
 * Whether a Patient is within the Cancellation Window — strictly more than 24
 * hours before the start time. (The Professional has no such restriction.)
 */
export function patientCanCancel(
  appointment: Pick<Appointment, "date" | "time">,
  now: Date,
): boolean {
  const hoursUntilStart =
    (startOf(appointment).getTime() - now.getTime()) / 3_600_000;
  return hoursUntilStart > CANCELLATION_WINDOW_HOURS;
}

/**
 * Cancellation — transition a Scheduled Appointment to Cancelled and send a
 * Cancellation Notice. The Professional may cancel at any time; a Patient only
 * within the Cancellation Window. Cancelling frees the Time Slot (Availability
 * counts only Scheduled times) and clears the one-open-per-phone gate.
 */
export async function cancel(
  appointmentId: string,
  actor: CancellationActor,
  deps: CancellationDependencies,
): Promise<CancellationResult> {
  const now = (deps.now ?? (() => new Date()))();
  const appointment = await deps.repository.findById(appointmentId);
  if (!appointment) {
    return { ok: false, rejection: "NotFound" };
  }

  const status = statusOf(appointment, now);
  if (status === "cancelled") {
    return { ok: false, rejection: "AlreadyCancelled" };
  }
  if (status === "completed") {
    return { ok: false, rejection: "AlreadyCompleted" };
  }

  if (actor === "patient" && !patientCanCancel(appointment, now)) {
    return { ok: false, rejection: "OutsideCancellationWindow" };
  }

  await deps.repository.markCancelled(appointmentId);
  const cancelled: Appointment = { ...appointment, status: "cancelled" };

  // Best-effort, decoupled (ADR-0001).
  try {
    await deps.notifyCancellation(cancelled);
  } catch {
    // swallowed on purpose
  }

  // The Cancellation email is an independent best-effort channel — its failure
  // (or missing mail config) must likewise never cost the cancellation.
  try {
    await deps.sendCancellationEmail(cancelled, actor);
  } catch {
    // swallowed on purpose
  }

  return { ok: true, appointment: cancelled };
}
