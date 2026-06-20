import type { Appointment } from "../appointments/appointment";
import { dispatchNotification, type DispatchDependencies } from "./dispatch";

/**
 * Send a Cancellation Notice for an Appointment — sent whenever an Appointment
 * becomes Cancelled, regardless of who cancelled it (CONTEXT.md). Callers
 * invoke this best-effort (ADR-0001). Unlike the Confirmation it records no
 * Appointment-level bookkeeping; the outbox entry is the record.
 */
export async function notifyCancellation(
  appointment: Appointment,
  deps: DispatchDependencies,
): Promise<void> {
  await dispatchNotification(
    {
      kind: "cancellation-notice",
      appointmentId: appointment.id,
      patientPhone: appointment.patientPhone,
    },
    deps,
  );
}
