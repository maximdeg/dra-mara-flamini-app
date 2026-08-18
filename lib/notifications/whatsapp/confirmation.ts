import type { Appointment } from "../../appointments/appointment";
import {
  CONSULT_TYPE_LABELS,
  PRACTICE_TYPE_LABELS,
  VISIT_TYPE_LABELS,
} from "../../appointments/visit-type";
import { coverageLabel } from "../../coverage/coverage";
import { formatDateAR } from "../../datetime/format";
import type { WhatsAppMessage } from "./whatsapp-sender";

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
 * These constants must match what was submitted to and approved by Meta; a
 * name/language mismatch is rejected with error 132001, a parameter-count
 * mismatch with 100 (both proven while wiring this up).
 */
const CONFIRMATION_TEMPLATE_NAME = "appointment_confirmation_1";
const CONFIRMATION_TEMPLATE_LANGUAGE = "es_AR";

export interface ConfirmationLinks {
  /** Absolute URL of the Patient's Appointment page (`/cita/[id]`). */
  manageUrl: string;
}

/**
 * The Confirmation WhatsApp for a booked Appointment — a Patient-ready
 * `WhatsAppMessage` referencing the approved template with its six body
 * parameters in `{{1}}…{{6}}` order. Pure: the absolute manage link is passed in
 * (built from `siteUrl`) so this stays testable without env, exactly like the
 * confirmation email builder.
 */
export function confirmationWhatsApp(
  appointment: Appointment,
  links: ConfirmationLinks,
): WhatsAppMessage {
  return {
    to: appointment.patientPhone,
    templateName: CONFIRMATION_TEMPLATE_NAME,
    language: CONFIRMATION_TEMPLATE_LANGUAGE,
    params: [
      appointment.patientFirstName, // {{1}} nombre
      formatDateAR(appointment.date), // {{2}} fecha
      appointment.time, // {{3}} hora
      visitTypeLabel(appointment), // {{4}} tipo
      coverageLabel(appointment.coverage), // {{5}} obra social
      links.manageUrl, // {{6}} enlace
    ],
  };
}

/**
 * The template's "Tipo" line ({{4}}) — the human-readable Spanish visit type.
 * Prefers the specific sub-type (Consulta/Práctica flavor) shown on the cita
 * page, falling back to the top-level Visit Type label. WhatsApp body parameters
 * cannot contain newlines or 4+ consecutive spaces, so the label is a single
 * clean phrase.
 */
function visitTypeLabel(appointment: Appointment): string {
  if (appointment.consultType) {
    return `${VISIT_TYPE_LABELS[appointment.visitType]} · ${CONSULT_TYPE_LABELS[appointment.consultType]}`;
  }
  if (appointment.practiceType) {
    return `${VISIT_TYPE_LABELS[appointment.visitType]} · ${PRACTICE_TYPE_LABELS[appointment.practiceType]}`;
  }
  return VISIT_TYPE_LABELS[appointment.visitType];
}
