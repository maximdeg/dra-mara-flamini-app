/**
 * The email-sending seam — the standalone email path's equivalent of the
 * WhatsApp `NotificationSender` (lib/notifications/sender.ts). Two adapters
 * satisfy it: the production `NodemailerEmailSender` (Gmail SMTP) and the
 * `FakeEmailSender` below, used in tests and dev.
 *
 * Email is delivered best-effort and decoupled from booking/cancellation
 * (ADR-0001): a send failure must never cost a Patient their Appointment.
 */

/** A transactional email to a Patient — channel-agnostic, already rendered. */
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  /** Plain-text fallback, sent alongside the HTML. */
  text: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<{ messageId: string }>;
}

/**
 * Fake sender — records every message and returns a synthetic id instead of
 * delivering. Stands in for Gmail in tests and dev; assert against `sent`/`last`.
 */
export class FakeEmailSender implements EmailSender {
  readonly sent: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<{ messageId: string }> {
    this.sent.push(message);
    return { messageId: `fake-email-${this.sent.length}` };
  }

  /** The most recently sent message, or undefined if none was sent. */
  get last(): EmailMessage | undefined {
    return this.sent.at(-1);
  }
}
