import type { Appointment } from "../appointments/appointment";
import { composeNotifications } from "./compose";
import type { NotificationKind } from "./notification";
import type { NotificationOutbox } from "./notification-outbox";

export interface EnqueueDependencies {
  outbox: NotificationOutbox;
  /** Public base URL, used to build the cancel link in a Confirmation. */
  baseUrl: string;
}

/**
 * Compose an Appointment's Notification for both Channels and enqueue one entry
 * each. The request side stops here (ADR-0001): a long-running worker drains the
 * outbox and delivers them, so booking/cancellation never block on delivery.
 */
export async function enqueueNotifications(
  appointment: Appointment,
  kind: NotificationKind,
  deps: EnqueueDependencies,
): Promise<void> {
  const notifications = composeNotifications(appointment, kind, deps.baseUrl);
  for (const notification of notifications) {
    await deps.outbox.enqueue(notification);
  }
}
