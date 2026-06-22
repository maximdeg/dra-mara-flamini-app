import type { Appointment } from "../appointments/appointment";
import {
  enqueueNotifications,
  type EnqueueDependencies,
} from "./enqueue-notifications";

export type ConfirmationNotificationDeps = EnqueueDependencies;

/**
 * Enqueue a Confirmation for a booked Appointment — one entry per Channel
 * (WhatsApp + Email). The worker delivers them and records the WhatsApp
 * bookkeeping when it sends (slice 02); the request side only enqueues, so a
 * delivery outage never costs the Patient their Appointment (ADR-0001). Callers
 * (Booking) still invoke this best-effort.
 */
export async function notifyConfirmation(
  appointment: Appointment,
  deps: ConfirmationNotificationDeps,
): Promise<void> {
  await enqueueNotifications(appointment, "confirmation", deps);
}
