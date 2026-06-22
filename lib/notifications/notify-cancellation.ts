import type { Appointment } from "../appointments/appointment";
import {
  enqueueNotifications,
  type EnqueueDependencies,
} from "./enqueue-notifications";

export type CancellationNotificationDeps = EnqueueDependencies;

/**
 * Enqueue a Cancellation Notice for an Appointment — sent whenever an
 * Appointment becomes Cancelled, regardless of who cancelled it (CONTEXT.md).
 * One entry per Channel; the worker delivers them. Unlike the Confirmation it
 * records no Appointment-level bookkeeping — the outbox entries are the record.
 * Callers invoke this best-effort (ADR-0001).
 */
export async function notifyCancellation(
  appointment: Appointment,
  deps: CancellationNotificationDeps,
): Promise<void> {
  await enqueueNotifications(appointment, "cancellation-notice", deps);
}
