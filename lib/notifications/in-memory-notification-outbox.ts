import { randomUUID } from "node:crypto";
import type {
  FailureOutcome,
  Notification,
  OutboxEntry,
} from "./notification";
import type { NotificationOutbox } from "./notification-outbox";

/**
 * In-memory adapter at the Notification outbox seam — the reference fake for
 * tests and local dev. Holds entries in a Map; no database. JS is single-
 * threaded, so the `claim` transition is trivially atomic here, mirroring the
 * Mongo adapter's atomic find-and-update.
 */
export class InMemoryNotificationOutbox implements NotificationOutbox {
  private readonly entries = new Map<string, OutboxEntry>();

  async enqueue(notification: Notification): Promise<OutboxEntry> {
    const entry: OutboxEntry = {
      id: randomUUID(),
      notification,
      status: "pending",
      attempts: 0,
      lastError: null,
      createdAt: new Date().toISOString(),
      sentAt: null,
      messageId: null,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  async pending(): Promise<OutboxEntry[]> {
    return [...this.entries.values()].filter(
      (entry) => entry.status === "pending",
    );
  }

  async claim(id: string): Promise<OutboxEntry | null> {
    const entry = this.entries.get(id);
    if (!entry || entry.status !== "pending") {
      return null;
    }
    const claimed: OutboxEntry = { ...entry, status: "sending" };
    this.entries.set(id, claimed);
    return claimed;
  }

  async markSent(id: string, messageId: string, sentAt: string): Promise<void> {
    const entry = this.entries.get(id);
    if (entry) {
      this.entries.set(id, { ...entry, status: "sent", messageId, sentAt });
    }
  }

  async markFailed(id: string, outcome: FailureOutcome): Promise<void> {
    const entry = this.entries.get(id);
    if (entry) {
      this.entries.set(id, {
        ...entry,
        status: outcome.status,
        attempts: outcome.attempts,
        lastError: outcome.error,
      });
    }
  }

  /** Test/dev helper — the current queue contents. */
  all(): OutboxEntry[] {
    return [...this.entries.values()];
  }
}
