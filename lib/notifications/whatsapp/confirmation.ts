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

/**
 * What {{6}} says when the coverage had no Instructions — Meta rejects an empty
 * body parameter, so the line always reads as something.
 */
export const NO_INSTRUCTIONS_FALLBACK = "Sin indicaciones adicionales.";

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
  const details = [
    appointment.patientFirstName, // {{1}} nombre
    formatDateAR(appointment.date), // {{2}} fecha
    appointment.time, // {{3}} hora
    visitTypeLabel(appointment), // {{4}} tipo
    coverageLabel(appointment.coverage), // {{5}} obra social
  ];
  return {
    to: appointment.patientPhone,
    templateName: CONFIRMATION_TEMPLATE_NAME,
    language: CONFIRMATION_TEMPLATE_LANGUAGE,
    params: withInstructions
      ? [
          ...details,
          // {{6}} indicaciones — already one sanitized line (copied at booking)
          appointment.coverageInstructions || NO_INSTRUCTIONS_FALLBACK,
          links.manageUrl, // {{7}} enlace
        ]
      : [...details, links.manageUrl], // {{6}} enlace
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
