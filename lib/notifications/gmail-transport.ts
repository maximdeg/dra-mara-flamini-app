import nodemailer from "nodemailer";
import type { MailTransport } from "./email-sender";

export interface GmailTransportConfig {
  /** The Gmail address messages are sent from. */
  user: string;
  /** A Gmail App Password (the account must have 2-Step Verification enabled). */
  appPassword: string;
}

/**
 * The production mail transport: nodemailer over Gmail, authenticated with an
 * App Password (ADR-0003). This is the thin, infrastructure-only seam — it is
 * verified manually against a real inbox, not in the unit suite; the mapping and
 * error behavior live in EmailNotificationSender, tested through a fake transport.
 */
export function createGmailTransport(config: GmailTransportConfig): MailTransport {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: config.user, pass: config.appPassword },
  });

  return {
    async sendMail(message) {
      const info = await transporter.sendMail(message);
      return { messageId: info.messageId };
    },
  };
}
