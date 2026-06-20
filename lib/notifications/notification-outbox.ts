import type { Notification, OutboxEntry } from "./notification";

/**
 * The Notification outbox seam — the persistent queue of Notifications
 * (ADR-0001: the persistent session/queue is the architectural heart). Two
 * adapters satisfy it: MongoNotificationOutbox in production, and
 * InMemoryNotificationOutbox in tests/dev.
 *
 * Kept narrow: `enqueue` records a pending Notification, `markSent` records its
 * delivery. The real Baileys worker slice will grow it (e.g. `pending()`,
 * `markFailed`) when it needs to drain the queue.
 */
export interface NotificationOutbox {
  enqueue(notification: Notification): Promise<OutboxEntry>;
  markSent(id: string, messageId: string, sentAt: string): Promise<void>;
}
