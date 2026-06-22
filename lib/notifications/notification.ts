/**
 * A Notification — a message the system sends to the Patient about their
 * Appointment (CONTEXT.md). Two kinds: a Confirmation (on booking) and a
 * Cancellation Notice (on any cancellation), each sent over two Channels:
 * WhatsApp and Email. A single logical Notification (e.g. a Confirmation) is
 * enqueued as one entry per Channel, so the two can succeed/retry independently.
 */
export type NotificationKind = "confirmation" | "cancellation-notice";

/** The Channels a Notification goes out on (CONTEXT.md). */
export type NotificationChannel = "whatsapp" | "email";

/** The composed WhatsApp body — a single block of text. */
export interface WhatsAppMessage {
  text: string;
}

/** The composed email — a subject plus HTML and plain-text bodies. */
export interface EmailMessage {
  subject: string;
  html: string;
  text: string;
}

interface BaseNotification {
  kind: NotificationKind;
  appointmentId: string;
}

/**
 * A Notification bound to its Channel, carrying the recipient and the body
 * composed at enqueue time (so a persisted entry is a full record of what was
 * sent). The `channel` discriminant lets a per-Channel sender narrow the body.
 */
export interface WhatsAppNotification extends BaseNotification {
  channel: "whatsapp";
  /** The Patient's phone (normalized to a WhatsApp JID by the sender — slice 04). */
  recipient: string;
  message: WhatsAppMessage;
}

export interface EmailNotification extends BaseNotification {
  channel: "email";
  /** The Patient's email address. */
  recipient: string;
  message: EmailMessage;
}

export type Notification = WhatsAppNotification | EmailNotification;

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
