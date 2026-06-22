import type { Appointment } from "../appointments/appointment";
import { composeNotifications } from "./compose";
import { dispatchNotification, type DispatchDependencies } from "./dispatch";

export interface CancellationNotificationDeps extends DispatchDependencies {
  /** Public base URL — carried for parity with the Confirmation; the Notice has no cancel link. */
  baseUrl: string;
}

/**
 * Send a Cancellation Notice for an Appointment — sent whenever an Appointment
 * becomes Cancelled, regardless of who cancelled it (CONTEXT.md). Composes the
 * WhatsApp and Email bodies and dispatches one entry per Channel. Callers invoke
 * this best-effort (ADR-0001). Unlike the Confirmation it records no
 * Appointment-level bookkeeping; the outbox entries are the record.
 */
export async function notifyCancellation(
  appointment: Appointment,
  deps: CancellationNotificationDeps,
): Promise<void> {
  const notifications = composeNotifications(
    appointment,
    "cancellation-notice",
    deps.baseUrl,
  );
  for (const notification of notifications) {
    await dispatchNotification(notification, deps);
  }
}
