import type { EmailMessage, EmailSender } from "./email-sender";

/**
 * The slice of a nodemailer `Transporter` this adapter uses. Narrowing to the
 * one method keeps the adapter unit-testable with a plain stub (no SMTP), while
 * a real `nodemailer.createTransport(...)` result is assignable to it.
 */
export interface MailTransport {
  sendMail(options: {
    from: string;
    replyTo: string;
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<{ messageId: string }>;
}

/**
 * Production EmailSender — delivers over an injected nodemailer transport (Gmail
 * SMTP in production; see get-email-sender). The From identity and Reply-To are
 * fixed per deployment and supplied by the factory.
 */
export class NodemailerEmailSender implements EmailSender {
  constructor(
    private readonly transport: MailTransport,
    private readonly from: string,
    private readonly replyTo: string,
  ) {}

  async send(message: EmailMessage): Promise<{ messageId: string }> {
    const { messageId } = await this.transport.sendMail({
      from: this.from,
      replyTo: this.replyTo,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    return { messageId };
  }
}
