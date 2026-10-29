import type { Appointment } from "../../appointments/appointment";
import { appointmentDetailParams, instructionsParam } from "./appointment-params";
import type { WhatsAppMessage } from "./whatsapp-sender";

/**
 * The approved `confirmation_reminder` [es_AR] template, sent the day before
 * the Appointment. Its body reads "Te recordamos tu visita de mañana…" followed by
 * {{1}} nombre, {{2}} fecha, {{3}} hora, {{4}} tipo, {{5}} obra social,
 * {{6}} notas a tener en cuenta, and {{7}} the link to the cita page.
 *
 * As with the other templates, the name, language, and parameter count are a
 * contract with what Meta approved (132001 on a name mismatch, 100 on a count
 * mismatch). The `.env` copy of the name is read only by the smoke script.
 */
const REMINDER_TEMPLATE_NAME = "confirmation_reminder";
const REMINDER_TEMPLATE_LANGUAGE = "es_AR";

export interface ReminderLinks {
  /** Absolute URL of the Patient's Appointment page (`/cita/[id]`). */
  manageUrl: string;
}

/**
 * The Reminder WhatsApp for a Scheduled Appointment. Pure, like
 * `confirmationWhatsApp`: the absolute link is passed in.
 */
export function reminderWhatsApp(
  appointment: Appointment,
  links: ReminderLinks,
): WhatsAppMessage {
  return {
    to: appointment.patientPhone,
    templateName: REMINDER_TEMPLATE_NAME,
    language: REMINDER_TEMPLATE_LANGUAGE,
    params: [
      ...appointmentDetailParams(appointment), // {{1}}–{{5}}
      instructionsParam(appointment), // {{6}} notas
      links.manageUrl, // {{7}} enlace
    ],
  };
}
