/**
 * The WhatsApp-sending seam — the WhatsApp equivalent of the email path's
 * `EmailSender` (lib/notifications/email/email-sender.ts). Two adapters satisfy
 * it: the production `MetaWhatsAppSender` (Meta WhatsApp Cloud API, ADR-0003) and
 * the `FakeWhatsAppSender` below, used in tests and dev.
 *
 * Like email, a WhatsApp message is delivered best-effort and decoupled from
 * booking/cancellation (ADR-0001, superseded by ADR-0003 which keeps this
 * best-effort rule): a send failure must never cost a Patient their Appointment.
 */

/**
 * A Patient-ready WhatsApp message — channel-agnostic, already rendered. The
 * Meta Cloud API only sends pre-approved templates (ADR-0003), so a message is a
 * template reference (`templateName` + `language`) plus the ordered body
 * parameters that fill its `{{1}}`, `{{2}}`, … placeholders.
 */
export interface WhatsAppMessage {
  /** Recipient phone in E.164 (e.g. "+5491134286716"). */
  to: string;
  /** Approved template name, e.g. "appointment_confirmation_1". */
  templateName: string;
  /** Template language code, e.g. "es_AR". */
  language: string;
  /** Body parameters in `{{1}}…{{N}}` order. */
  params: string[];
}

export interface WhatsAppSender {
  send(message: WhatsAppMessage): Promise<{ messageId: string }>;
}

/**
 * Fake sender — records every message and returns a synthetic id instead of
 * delivering. Stands in for the Cloud API in tests and dev; assert against
 * `sent`/`last`. Mirrors FakeEmailSender.
 */
export class FakeWhatsAppSender implements WhatsAppSender {
  readonly sent: WhatsAppMessage[] = [];

  async send(message: WhatsAppMessage): Promise<{ messageId: string }> {
    this.sent.push(message);
    return { messageId: `fake-whatsapp-${this.sent.length}` };
  }

  /** The most recently sent message, or undefined if none was sent. */
  get last(): WhatsAppMessage | undefined {
    return this.sent.at(-1);
  }
}
