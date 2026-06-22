import type { Notification, NotificationChannel } from "./notification";
import type { NotificationSender } from "./sender";

/**
 * Routes a Notification to the sender for its Channel — the single
 * `NotificationSender` the worker drains through. It lets each Channel have its
 * own adapter (real Baileys / nodemailer, or a fake) while the drain loop stays
 * Channel-agnostic.
 */
export class ChannelRouter implements NotificationSender {
  constructor(
    private readonly senders: Record<NotificationChannel, NotificationSender>,
  ) {}

  send(notification: Notification): Promise<{ messageId: string }> {
    return this.senders[notification.channel].send(notification);
  }
}
