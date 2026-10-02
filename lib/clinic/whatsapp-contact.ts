/**
 * The clinic's WhatsApp contact for the public site: a `wa.me` link the Patient
 * opens themselves (e.g. to ask about an Aesthetic Treatment). Unrelated to the
 * WhatsApp notifications the system sends — those live under
 * lib/notifications/whatsapp.
 *
 * Hard-coded on purpose: changing the number is a deploy, not an admin setting.
 */

/** International form, digits only — what `wa.me` expects in its path. */
const CLINIC_WHATSAPP_DIGITS = "5493425782344";

/** The same number as shown to Patients. */
export const CLINIC_WHATSAPP_DISPLAY = "+54 9 3425 78-2344";

/** A `wa.me` link to the clinic, with `message` prefilled when given. */
export function clinicWhatsAppLink(message: string): string {
  const base = `https://wa.me/${CLINIC_WHATSAPP_DIGITS}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
