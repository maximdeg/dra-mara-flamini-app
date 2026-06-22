import type { Notification } from "./notification";
import { phoneToWhatsAppJid } from "./phone-jid";
import type { NotificationSender } from "./sender";
import type { WhatsAppSocket } from "./whatsapp-socket";

/**
 * Delivers a Notification over WhatsApp (ADR-0001), through a WhatsAppSocket. A
 * thin adapter: normalize the Patient's phone to a JID, confirm the number is on
 * WhatsApp (so a Patient who isn't still gets the email Channel), send the
 * composed text, and return the WhatsApp message id for the outbox entry.
 *
 * When the number isn't on WhatsApp it throws, so the worker marks only this
 * Channel's entry failed — the email entry is untouched.
 */
export class WhatsAppNotificationSender implements NotificationSender {
  constructor(private readonly socket: WhatsAppSocket) {}

  async send(notification: Notification): Promise<{ messageId: string }> {
    if (notification.channel !== "whatsapp") {
      throw new Error(
        `WhatsAppNotificationSender cannot send a ${notification.channel} Notification`,
      );
    }

    const jid = await this.socket.resolveJid(
      phoneToWhatsAppJid(notification.recipient),
    );
    if (!jid) {
      throw new Error(`${notification.recipient} is not on WhatsApp`);
    }

    const { id } = await this.socket.sendText(jid, notification.message.text);
    return { messageId: id };
  }
}
