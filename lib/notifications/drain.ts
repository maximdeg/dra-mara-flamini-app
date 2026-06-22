import type { AppointmentRepository } from "../appointments/appointment-repository";
import type { NotificationOutbox } from "./notification-outbox";
import type { NotificationSender } from "./sender";

/** Default cap on delivery attempts before an entry is given up as `failed`. */
export const DEFAULT_MAX_ATTEMPTS = 5;

export interface DrainDependencies {
  outbox: NotificationOutbox;
  sender: NotificationSender;
  /** Used to record WhatsApp Confirmation bookkeeping on the Appointment. */
  appointments: AppointmentRepository;
  now?: () => Date;
  maxAttempts?: number;
}

export interface DrainResult {
  sent: number;
  failed: number;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Drain the Notification outbox once — the orchestration a worker tick runs
 * (ADR-0001: delivery is decoupled from booking/cancellation). For each pending
 * entry it claims it (so no other tick double-sends), delivers it through the
 * Channel sender, and records the result: `markSent` on success, or `markFailed`
 * on error — back to `pending` for a retry, or `failed` once the attempt cap is
 * reached. A successful WhatsApp Confirmation also records the Appointment's
 * bookkeeping. Each entry is handled independently, so one Channel failing never
 * affects the other.
 */
export async function drainOutbox(deps: DrainDependencies): Promise<DrainResult> {
  const now = deps.now ?? (() => new Date());
  const maxAttempts = deps.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

  const pending = await deps.outbox.pending();
  let sent = 0;
  let failed = 0;

  for (const entry of pending) {
    const claimed = await deps.outbox.claim(entry.id);
    if (!claimed) {
      continue; // another tick already took it
    }

    try {
      const { messageId } = await deps.sender.send(claimed.notification);
      const sentAt = now().toISOString();
      await deps.outbox.markSent(claimed.id, messageId, sentAt);

      const { kind, channel, appointmentId } = claimed.notification;
      if (kind === "confirmation" && channel === "whatsapp") {
        await deps.appointments.markConfirmationSent(
          appointmentId,
          sentAt,
          messageId,
        );
      }
      sent += 1;
    } catch (error) {
      const attempts = claimed.attempts + 1;
      await deps.outbox.markFailed(claimed.id, {
        attempts,
        error: errorMessage(error),
        status: attempts >= maxAttempts ? "failed" : "pending",
      });
      failed += 1;
    }
  }

  return { sent, failed };
}
