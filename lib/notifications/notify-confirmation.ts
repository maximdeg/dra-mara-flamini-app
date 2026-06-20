import type { Appointment } from "../appointments/appointment";
import type { AppointmentRepository } from "../appointments/appointment-repository";
import { dispatchNotification, type DispatchDependencies } from "./dispatch";

export interface ConfirmationNotificationDeps extends DispatchDependencies {
  appointments: AppointmentRepository;
}

/**
 * Send a Confirmation for an Appointment: dispatch it through the outbox/sender
 * and record the WhatsApp bookkeeping on the Appointment. Callers (Booking)
 * invoke this best-effort — it may throw, and that must never cost the Patient
 * their Appointment (ADR-0001).
 */
export async function notifyConfirmation(
  appointment: Appointment,
  deps: ConfirmationNotificationDeps,
): Promise<void> {
  const { messageId, sentAt } = await dispatchNotification(
    {
      kind: "confirmation",
      appointmentId: appointment.id,
      patientPhone: appointment.patientPhone,
    },
    deps,
  );
  await deps.appointments.markConfirmationSent(appointment.id, sentAt, messageId);
}
