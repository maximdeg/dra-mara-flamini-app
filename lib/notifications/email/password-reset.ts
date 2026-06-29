import type { EmailMessage } from "./email-sender";
import {
  BRAND_NAME,
  button,
  heading,
  paragraph,
  renderEmailLayout,
} from "./layout";

const SUBJECT = "Restablecé tu contraseña — Dra. Mara Flamini";

const EXPIRY_NOTE =
  "Este enlace vence en 30 minutos y solo puede usarse una vez. Si no pediste " +
  "restablecer tu contraseña, ignorá este mensaje: tu contraseña no cambia.";

/**
 * The password-reset email to the Professional — a ready `{ to, subject, html,
 * text }`. Unlike the Patient emails this is addressed to the Professional, and
 * its only dynamic piece is the absolute reset link (built from `siteUrl`), kept
 * pure so it stays testable without env.
 */
export function passwordResetEmail(to: string, resetUrl: string): EmailMessage {
  const content = [
    heading("Restablecé tu contraseña"),
    paragraph(
      "Recibimos un pedido para restablecer la contraseña de tu panel. " +
        "Tocá el botón para elegir una nueva.",
    ),
    button(resetUrl, "Restablecer contraseña"),
    paragraph(EXPIRY_NOTE),
  ].join("\n");

  const text = [
    "Restablecé tu contraseña",
    "",
    "Recibimos un pedido para restablecer la contraseña de tu panel. Abrí " +
      "este enlace para elegir una nueva:",
    resetUrl,
    "",
    EXPIRY_NOTE,
    "",
    BRAND_NAME,
  ].join("\n");

  return {
    to,
    subject: SUBJECT,
    html: renderEmailLayout(content),
    text,
  };
}
