import type { Appointment } from "../../appointments/appointment";
import type { AppointmentRepository } from "../../appointments/appointment-repository";
import { siteUrl } from "../../site-url";
import { whatsappConsentGiven } from "./consent";
import { reminderWhatsApp } from "./reminder";
import type { WhatsAppSender } from "./whatsapp-sender";

export interface ReminderWhatsAppDeps {
  sender: WhatsAppSender;
  appointments: AppointmentRepository;
  now?: () => Date;
}

export type ReminderOutcome = "sent" | "skipped";

/**
 * Send the day-before Reminder for one Appointment and record it on the
 * Appointment. It skips a Patient who declined WhatsApp, and an Appointment
 * that was already reminded, so running the batch twice never double-sends.
 * A sender failure propagates; the batch catches it per Appointment.
 */
export async function sendReminderWhatsApp(
  appointment: Appointment,
  deps: ReminderWhatsAppDeps,
): Promise<ReminderOutcome> {
  if (!whatsappConsentGiven(appointment) || appointment.reminderSentAt) {
    return "skipped";
  }

  const message = reminderWhatsApp(appointment, {
    manageUrl: siteUrl(`/cita/${appointment.id}`),
  });
  const { messageId } = await deps.sender.send(message);
  const sentAt = (deps.now ?? (() => new Date()))().toISOString();
  await deps.appointments.markReminderSent(appointment.id, sentAt, messageId);
  return "sent";
}
