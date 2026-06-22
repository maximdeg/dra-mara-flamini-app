import type {
  FailureOutcome,
  Notification,
  OutboxEntry,
} from "./notification";

/**
 * The Notification outbox seam — the persistent queue of Notifications
 * (ADR-0001: the persistent session/queue is the architectural heart). Two
 * adapters satisfy it: MongoNotificationOutbox in production, and
 * InMemoryNotificationOutbox in tests/dev.
 *
 * The request side only `enqueue`s; the decoupled worker drains via `pending`,
 * `claim`, and `markSent`/`markFailed`. `claim` is the double-send guard — it
 * atomically moves a `pending` entry to `sending`, so two ticks (or a restart
 * mid-drain) can never deliver the same Notification twice.
 */
export interface NotificationOutbox {
  enqueue(notification: Notification): Promise<OutboxEntry>;
  /** Entries awaiting delivery (status `pending`). */
  pending(): Promise<OutboxEntry[]>;
  /**
   * Atomically claim a `pending` entry for sending (→ `sending`), returning it.
   * Returns null if it is no longer pending (another tick already claimed it).
   */
  claim(id: string): Promise<OutboxEntry | null>;
  markSent(id: string, messageId: string, sentAt: string): Promise<void>;
  markFailed(id: string, outcome: FailureOutcome): Promise<void>;
}
