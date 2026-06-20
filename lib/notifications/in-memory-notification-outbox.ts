import { randomUUID } from "node:crypto";
import type { Notification, OutboxEntry } from "./notification";
import type { NotificationOutbox } from "./notification-outbox";

/**
 * In-memory adapter at the Notification outbox seam — the reference fake for
 * tests and local dev. Holds entries in a Map; no database.
 */
export class InMemoryNotificationOutbox implements NotificationOutbox {
  private readonly entries = new Map<string, OutboxEntry>();

  async enqueue(notification: Notification): Promise<OutboxEntry> {
    const entry: OutboxEntry = {
      id: randomUUID(),
      notification,
      status: "pending",
      createdAt: new Date().toISOString(),
      sentAt: null,
      messageId: null,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  async markSent(id: string, messageId: string, sentAt: string): Promise<void> {
    const entry = this.entries.get(id);
    if (entry) {
      this.entries.set(id, { ...entry, status: "sent", messageId, sentAt });
    }
  }

  /** Test/dev helper — the current queue contents. */
  all(): OutboxEntry[] {
    return [...this.entries.values()];
  }
}
