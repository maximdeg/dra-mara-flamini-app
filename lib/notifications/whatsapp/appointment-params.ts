import type { Appointment } from "../../appointments/appointment";
import {
  CONSULT_TYPE_LABELS,
  APPOINTMENT_PRACTICE_TYPE_LABELS,
  VISIT_TYPE_LABELS,
} from "../../appointments/visit-type";
import { coverageLabel } from "../../coverage/coverage";
import { formatDateAR } from "../../datetime/format";

/**
 * What the indicaciones parameter says when the coverage had no Instructions.
 * Meta rejects an empty body parameter, so the line always reads as something.
 */
export const NO_INSTRUCTIONS_FALLBACK = "Sin indicaciones adicionales.";

/**
 * The Appointment details every Appointment template opens with, in order:
 * nombre, fecha (DD/MM/YYYY), hora, tipo, obra social. The Confirmation and
 * the Reminder share them, so both messages describe an Appointment the same way.
 */
export function appointmentDetailParams(appointment: Appointment): string[] {
  return [
    appointment.patientFirstName,
    formatDateAR(appointment.date),
    appointment.time,
    visitTypeLabel(appointment),
    coverageLabel(appointment.coverage),
  ];
}

/**
 * The Coverage Instructions parameter: the line copied at booking (already
 * sanitized to one line), or the fallback when there were none.
 */
export function instructionsParam(appointment: Appointment): string {
  return appointment.coverageInstructions || NO_INSTRUCTIONS_FALLBACK;
}

/**
 * The "Tipo" line, as a human-readable Spanish label. It prefers the specific
 * sub-type (Consulta/Práctica flavor) shown on the cita page and falls back to
 * the top-level Visit Type label. WhatsApp body parameters cannot contain
 * newlines or runs of 4+ spaces, so the label is a single clean phrase.
 */
function visitTypeLabel(appointment: Appointment): string {
  if (appointment.consultType) {
    return `${VISIT_TYPE_LABELS[appointment.visitType]} · ${CONSULT_TYPE_LABELS[appointment.consultType]}`;
  }
  if (appointment.practiceType) {
    return `${VISIT_TYPE_LABELS[appointment.visitType]} · ${APPOINTMENT_PRACTICE_TYPE_LABELS[appointment.practiceType]}`;
  }
  return VISIT_TYPE_LABELS[appointment.visitType];
}
