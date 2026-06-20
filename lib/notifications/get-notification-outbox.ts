import { getDb } from "../db/mongo";
import { MongoNotificationOutbox } from "./mongo-notification-outbox";
import type { NotificationOutbox } from "./notification-outbox";

/**
 * Production wiring at the Notification outbox seam: a MongoDB-backed outbox.
 * Tests construct an InMemoryNotificationOutbox directly.
 */
export async function getNotificationOutbox(): Promise<NotificationOutbox> {
  const db = await getDb();
  return new MongoNotificationOutbox(db);
}
