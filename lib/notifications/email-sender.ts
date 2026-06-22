import type { Notification } from "./notification";
import type { NotificationSender } from "./sender";

/** A composed email ready to hand to a transport. */
export interface MailMessage {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * The mail transport seam — just enough of nodemailer to send one message and
 * learn its id. The real Gmail transport (gmail-transport.ts) satisfies it; a
 * fake stands in for tests, so EmailNotificationSender is testable without SMTP.
 */
export interface MailTransport {
  sendMail(message: MailMessage): Promise<{ messageId: string }>;
}

/**
 * Delivers a Notification over Email (ADR-0003). A thin adapter: it maps the
 * composed email body onto the transport and returns the provider message id for
 * the outbox entry. It only handles the `email` Channel — the ChannelRouter
 * never hands it anything else, and the guard makes that explicit.
 */
export class EmailNotificationSender implements NotificationSender {
  constructor(
    private readonly transport: MailTransport,
    private readonly from: string,
  ) {}

  async send(notification: Notification): Promise<{ messageId: string }> {
    if (notification.channel !== "email") {
      throw new Error(
        `EmailNotificationSender cannot send a ${notification.channel} Notification`,
      );
    }
    const { subject, html, text } = notification.message;
    return this.transport.sendMail({
      from: this.from,
      to: notification.recipient,
      subject,
      html,
      text,
    });
  }
}
