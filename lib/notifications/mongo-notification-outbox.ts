import { randomUUID } from "node:crypto";
import type { Db } from "mongodb";
import type { Notification, OutboxEntry } from "./notification";
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
      createdAt: new Date().toISOString(),
      sentAt: null,
      messageId: null,
    };
    await this.db.collection(COLLECTION).insertOne({ ...entry });
    return entry;
  }

  async markSent(id: string, messageId: string, sentAt: string): Promise<void> {
    await this.db
      .collection(COLLECTION)
      .updateOne({ id }, { $set: { status: "sent", messageId, sentAt } });
  }
}
