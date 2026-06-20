/**
 * A Notification — a WhatsApp message the system sends to the Patient about
 * their Appointment (CONTEXT.md). Two kinds: a Confirmation (on booking) and a
 * Cancellation Notice (on any cancellation; slice 08).
 */
export type NotificationKind = "confirmation" | "cancellation-notice";

export interface Notification {
  kind: NotificationKind;
  appointmentId: string;
  patientPhone: string;
}

export type OutboxStatus = "pending" | "sent";

/**
 * A queued Notification. Per ADR-0001 messages are enqueued best-effort and
 * sent by a worker, decoupled from booking/cancellation — so each enqueued
 * Notification has its own send state, independent of the Appointment.
 */
export interface OutboxEntry {
  id: string;
  notification: Notification;
  status: OutboxStatus;
  createdAt: string;
  sentAt: string | null;
  messageId: string | null;
}
