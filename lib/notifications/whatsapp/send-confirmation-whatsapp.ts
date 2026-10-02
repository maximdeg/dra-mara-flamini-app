import type { Appointment } from "../../appointments/appointment";
import type { AppointmentRepository } from "../../appointments/appointment-repository";
import { siteUrl } from "../../site-url";
import { confirmationWhatsApp } from "./confirmation";
import { whatsappConsentGiven } from "./consent";
import type { WhatsAppSender } from "./whatsapp-sender";

export interface ConfirmationWhatsAppDeps {
  sender: WhatsAppSender;
  appointments: AppointmentRepository;
  /** Whether the approved template takes Coverage Instructions (7 params). */
  withInstructions?: boolean;
  now?: () => Date;
}

/**
 * Send the Confirmation WhatsApp for an Appointment: render the approved
 * template, deliver it via the WhatsAppSender, and record the WhatsApp
 * bookkeeping on the Appointment. The manage link is the absolute `/cita/[id]`
 * URL (built from `siteUrl`). Callers (Booking) invoke this best-effort — it may
 * throw, and that must never cost the Patient their Appointment (ADR-0001, kept
 * by ADR-0003). Mirrors sendConfirmationEmail exactly.
 */
export async function sendConfirmationWhatsApp(
  appointment: Appointment,
  deps: ConfirmationWhatsAppDeps,
): Promise<void> {
  // A Patient who declined WhatsApp gets no message — Meta requires opt-in, and
  // messaging without it invites blocks and reports that cost the clinic's
  // sender quality rating. The email Confirmation still goes out.
  if (!whatsappConsentGiven(appointment)) {
    return;
  }

  const message = confirmationWhatsApp(
    appointment,
    { manageUrl: siteUrl(`/cita/${appointment.id}`) },
    { withInstructions: deps.withInstructions },
  );
  const { messageId } = await deps.sender.send(message);
  const sentAt = (deps.now ?? (() => new Date()))().toISOString();
  await deps.appointments.markConfirmationSent(appointment.id, sentAt, messageId);
}
