import type { Appointment } from "../../appointments/appointment";

/**
 * Whether the clinic may send this Patient a WhatsApp.
 *
 * Meta requires a Patient to have opted in before a business sends them a
 * template; sending without it risks the Patient blocking or reporting the
 * number, which drives down the sender's quality rating and can tighten the
 * messaging tier. The booking form captures consent, so this is the single
 * predicate every send path consults.
 *
 * Appointments created before the checkbox existed carry no field at all
 * (`undefined`). Those are treated as consented: they were booked under the
 * prior arrangement where the clinic messaged every Patient, and refusing them
 * would silently cut off Confirmations for Appointments already in the book.
 * An explicit `null` is a Patient who unticked the box — a refusal, and the one
 * case that blocks a send.
 */
export function whatsappConsentGiven(
  appointment: Pick<Appointment, "whatsappConsentAt">,
): boolean {
  return appointment.whatsappConsentAt !== null;
}
