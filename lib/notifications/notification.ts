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

/**
 * An outbox entry's lifecycle: `pending` (awaiting a worker), `sending` (claimed
 * by a worker tick so no other tick double-sends it), `sent` (delivered), or
 * `failed` (gave up after the retry cap). A failed send that is still under the
 * cap returns to `pending` for the next tick.
 */
export type OutboxStatus = "pending" | "sending" | "sent" | "failed";

/**
 * The outcome the drain loop records for a failed send: the new attempt count,
 * the error, and whether the entry is retryable (`pending`) or terminal
 * (`failed`). The loop owns the retry policy; the outbox just records it.
 */
export interface FailureOutcome {
  attempts: number;
  error: string;
  status: "pending" | "failed";
}

/**
 * A queued Notification. Per ADR-0001 messages are enqueued best-effort and
 * sent by a worker, decoupled from booking/cancellation — so each enqueued
 * Notification has its own send state, independent of the Appointment.
 */
export interface OutboxEntry {
  id: string;
  notification: Notification;
  status: OutboxStatus;
  /** How many delivery attempts have been made (incremented on each failure). */
  attempts: number;
  /** The most recent send error, when one occurred. */
  lastError: string | null;
  createdAt: string;
  sentAt: string | null;
  messageId: string | null;
}
