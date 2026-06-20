import type { Notification } from "./notification";
import type { NotificationOutbox } from "./notification-outbox";
import type { NotificationSender } from "./sender";

export interface DispatchDependencies {
  outbox: NotificationOutbox;
  sender: NotificationSender;
  now?: () => Date;
}

/**
 * Enqueue a Notification, deliver it via the sender, and mark the outbox entry
 * sent — the shared path behind both the Confirmation and the Cancellation
 * Notice. Inline stand-in for the decoupled Baileys worker (deferred); callers
 * invoke it best-effort (ADR-0001).
 */
export async function dispatchNotification(
  notification: Notification,
  deps: DispatchDependencies,
): Promise<{ messageId: string; sentAt: string }> {
  const entry = await deps.outbox.enqueue(notification);
  const { messageId } = await deps.sender.send(notification);
  const sentAt = (deps.now ?? (() => new Date()))().toISOString();
  await deps.outbox.markSent(entry.id, messageId, sentAt);
  return { messageId, sentAt };
}
