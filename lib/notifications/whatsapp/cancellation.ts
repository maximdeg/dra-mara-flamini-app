import type { Appointment } from "../../appointments/appointment";
import type { CancellationActor } from "../../appointments/cancellation";
import { formatDateAR } from "../../datetime/format";
import type { WhatsAppMessage } from "./whatsapp-sender";

/**
 * The two approved Cancellation templates, chosen by who cancelled.
 *
 * Both are [es_AR] and take the same three body parameters ({{1}} nombre,
 * {{2}} fecha, {{3}} hora); only the copy differs — the Professional's
 * apologises for cancelling, the Patient's acknowledges their own cancellation.
 * Both close with the rebooking link, which is baked into the template body
 * rather than passed as a parameter, so neither needs a link param.
 *
 * As with the Confirmation, these names and the language are a contract with
 * what Meta approved: a mismatch is rejected 132001, a wrong parameter count
 * 100.
 */
const CANCELLATION_TEMPLATE_NAMES: Record<CancellationActor, string> = {
  professional: "appointment_cancellation_by_doctor",
  patient: "appointment_cancellation_by_patient1",
};
const CANCELLATION_TEMPLATE_LANGUAGE = "es_AR";

/**
 * The Cancellation WhatsApp for a cancelled Appointment — a Patient-ready
 * `WhatsAppMessage` referencing the template that matches the actor, with its
 * three body parameters in `{{1}}…{{3}}` order.
 *
 * Pure, exactly like `confirmationWhatsApp`: everything it needs comes from the
 * Appointment and the actor, so it is testable without env or network.
 */
export function cancellationWhatsApp(
  appointment: Appointment,
  actor: CancellationActor,
): WhatsAppMessage {
  return {
    to: appointment.patientPhone,
    templateName: CANCELLATION_TEMPLATE_NAMES[actor],
    language: CANCELLATION_TEMPLATE_LANGUAGE,
    params: [
      appointment.patientFirstName, // {{1}} nombre
      formatDateAR(appointment.date), // {{2}} fecha
      appointment.time, // {{3}} hora
    ],
  };
}
