import nodemailer from "nodemailer";
import type { EmailSender } from "./email-sender";
import { NodemailerEmailSender } from "./nodemailer-email-sender";

/** Display name on the From header, before the Gmail address. */
const FROM_NAME = "Dra. Mara Flamini · Dermatología";

/**
 * Production wiring at the email-sending seam: a nodemailer transport over Gmail
 * SMTP, authenticated with the clinic's Gmail app password. Env is read lazily
 * at call time, so importing this module never requires mail config — builds and
 * tests stay decoupled from Gmail. Tests construct a FakeEmailSender directly.
 */
export function getEmailSender(): EmailSender {
  const user = process.env.GOOGLE_EMAIL;
  const pass = process.env.GOOGLE_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error(
      "GOOGLE_EMAIL and GOOGLE_APP_PASSWORD must be set to send email",
    );
  }
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return new NodemailerEmailSender(transport, `${FROM_NAME} <${user}>`, user);
}
