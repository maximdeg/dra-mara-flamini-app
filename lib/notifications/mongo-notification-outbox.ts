import { randomUUID } from "node:crypto";
import type { Db } from "mongodb";
import type {
  FailureOutcome,
  Notification,
  OutboxEntry,
} from "./notification";
import type { NotificationOutbox } from "./notification-outbox";

const COLLECTION = "notificationOutbox";

/**
 * MongoDB adapter at the Notification outbox seam — the production queue. It
 * receives an already-connected Db. The entry's own `id` is the key; Mongo's
 * `_id` is not exposed.
 */
export class MongoNotificationOutbox implements NotificationOutbox {
  constructor(private readonly db: Db) {}

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
    await this.db.collection(COLLECTION).insertOne({ ...entry });
    return entry;
  }

  async pending(): Promise<OutboxEntry[]> {
    return this.db
      .collection<OutboxEntry>(COLLECTION)
      .find({ status: "pending" }, { projection: { _id: 0 } })
      .toArray();
  }

  async claim(id: string): Promise<OutboxEntry | null> {
    // Atomic pending → sending: only one tick can win the claim, so a
    // Notification is never delivered twice.
    return this.db
      .collection<OutboxEntry>(COLLECTION)
      .findOneAndUpdate(
        { id, status: "pending" },
        { $set: { status: "sending" } },
        { returnDocument: "after", projection: { _id: 0 } },
      );
  }

  async markSent(id: string, messageId: string, sentAt: string): Promise<void> {
    await this.db
      .collection(COLLECTION)
      .updateOne({ id }, { $set: { status: "sent", messageId, sentAt } });
  }

  async markFailed(id: string, outcome: FailureOutcome): Promise<void> {
    await this.db.collection(COLLECTION).updateOne(
      { id },
      {
        $set: {
          status: outcome.status,
          attempts: outcome.attempts,
          lastError: outcome.error,
        },
      },
    );
  }
}
