import type { Notification } from "./notification";

/**
 * The sender seam — actually delivering a Notification over WhatsApp. Two
 * adapters will satisfy it: the real Baileys worker (deferred to its own slice,
 * ADR-0001) and the FakeNotificationSender below, used in tests and dev.
 */
export interface NotificationSender {
  send(notification: Notification): Promise<{ messageId: string }>;
}

/**
 * Fake sender — pretends to deliver and returns a synthetic message id. Stands
 * in for the real Channel adapters (Baileys, nodemailer) until their slices are
 * built. The id encodes the Channel so the two enqueued entries are distinct.
 */
export class FakeNotificationSender implements NotificationSender {
  async send(notification: Notification): Promise<{ messageId: string }> {
    return {
      messageId: `fake-${notification.channel}-${notification.kind}-${notification.appointmentId}`,
    };
  }
}
