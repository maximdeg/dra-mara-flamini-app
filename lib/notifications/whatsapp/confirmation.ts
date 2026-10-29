import type { Appointment } from "../../appointments/appointment";
import { appointmentDetailParams, instructionsParam } from "./appointment-params";
import type { WhatsAppMessage } from "./whatsapp-sender";

export { NO_INSTRUCTIONS_FALLBACK } from "./appointment-params";

/**
 * The approved `appointment_confirmation_1` [es_AR] template, whose body is:
 *
 *   Hola {{1}},
 *   Tu visita con la doctora Mara Flamini Prida ha sido confirmada exitosamente.
 *   📅 Fecha: {{2}}
 *   🕐 Hora: {{3}}
 *   👨‍⚕️ Tipo: {{4}}
 *   🏥 Obra Social: {{5}}
 *   … enlace: {{6}}
 *
 * The Professional has edited it to carry Coverage Instructions — {{6}}
 * indicaciones, {{7}} enlace, {{1}}–{{5}} unchanged. Until Meta approves the
 * edit the 6-parameter body stays in use; `withInstructions` selects the
 * 7-parameter one (see confirmation-template.ts).
 *
 * These constants must match what was submitted to and approved by Meta; a
 * name/language mismatch is rejected with error 132001, a parameter-count
 * mismatch with 100 (both proven while wiring this up).
 */
const CONFIRMATION_TEMPLATE_NAME = "appointment_confirmation_1";
const CONFIRMATION_TEMPLATE_LANGUAGE = "es_AR";

export interface ConfirmationOptions {
  /** Whether the approved template has the 7-parameter Instructions body. */
  withInstructions?: boolean;
}

export interface ConfirmationLinks {
  /** Absolute URL of the Patient's Appointment page (`/cita/[id]`). */
  manageUrl: string;
}

/**
 * The Confirmation WhatsApp for a booked Appointment — a Patient-ready
 * `WhatsAppMessage` referencing the approved template with its body
 * parameters in order — six, or seven with Coverage Instructions. Pure: the absolute manage link is passed in
 * (built from `siteUrl`) so this stays testable without env, exactly like the
 * confirmation email builder.
 */
export function confirmationWhatsApp(
  appointment: Appointment,
  links: ConfirmationLinks,
  { withInstructions = false }: ConfirmationOptions = {},
): WhatsAppMessage {
  // {{1}} nombre, {{2}} fecha, {{3}} hora, {{4}} tipo, {{5}} obra social
  const details = appointmentDetailParams(appointment);
  return {
    to: appointment.patientPhone,
    templateName: CONFIRMATION_TEMPLATE_NAME,
    language: CONFIRMATION_TEMPLATE_LANGUAGE,
    params: withInstructions
      ? [
          ...details,
          instructionsParam(appointment), // {{6}} indicaciones
          links.manageUrl, // {{7}} enlace
        ]
      : [...details, links.manageUrl], // {{6}} enlace
  };
}
