import type { Appointment } from "../appointments/appointment";
import type { AppointmentRepository } from "../appointments/appointment-repository";
import { composeNotifications } from "./compose";
import { dispatchNotification, type DispatchDependencies } from "./dispatch";

export interface ConfirmationNotificationDeps extends DispatchDependencies {
  appointments: AppointmentRepository;
  /** Public base URL, used to build the cancel link in the Confirmation. */
  baseUrl: string;
}

/**
 * Send a Confirmation for an Appointment: compose the WhatsApp and Email bodies,
 * dispatch one entry per Channel through the outbox/sender, and record the
 * WhatsApp bookkeeping on the Appointment. Callers (Booking) invoke this
 * best-effort — it may throw, and that must never cost the Patient their
 * Appointment (ADR-0001).
 */
export async function notifyConfirmation(
  appointment: Appointment,
  deps: ConfirmationNotificationDeps,
): Promise<void> {
  const notifications = composeNotifications(
    appointment,
    "confirmation",
    deps.baseUrl,
  );
  for (const notification of notifications) {
    const { messageId, sentAt } = await dispatchNotification(notification, deps);
    if (notification.channel === "whatsapp") {
      await deps.appointments.markConfirmationSent(
        appointment.id,
        sentAt,
        messageId,
      );
    }
  }
}
