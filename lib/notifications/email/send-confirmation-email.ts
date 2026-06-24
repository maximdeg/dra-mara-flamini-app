import type { Appointment } from "../../appointments/appointment";
import type { AppointmentRepository } from "../../appointments/appointment-repository";
import { siteUrl } from "../../site-url";
import { confirmationEmail } from "./confirmation";
import type { EmailSender } from "./email-sender";

export interface ConfirmationEmailDeps {
  sender: EmailSender;
  appointments: AppointmentRepository;
  now?: () => Date;
}

/**
 * Send the Confirmation email for an Appointment: render it, deliver it via the
 * EmailSender, and record the email bookkeeping on the Appointment. The manage
 * link is the absolute `/cita/[id]` URL (built from `siteUrl`). Callers
 * (Booking) invoke this best-effort — it may throw, and that must never cost the
 * Patient their Appointment (ADR-0001).
 */
export async function sendConfirmationEmail(
  appointment: Appointment,
  deps: ConfirmationEmailDeps,
): Promise<void> {
  const message = confirmationEmail(appointment, {
    manageUrl: siteUrl(`/cita/${appointment.id}`),
  });
  const { messageId } = await deps.sender.send(message);
  const sentAt = (deps.now ?? (() => new Date()))().toISOString();
  await deps.appointments.markEmailSent(appointment.id, sentAt, messageId);
}
