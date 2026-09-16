import type { Db } from "mongodb";
import type { WhatsAppSendLog, WhatsAppSendRecord } from "./send-log";

const COLLECTION = "whatsappSends";

/**
 * MongoDB adapter at the Send Log seam — the production implementation.
 *
 * Like the Appointment repository it receives an already-connected Db rather
 * than creating its own connection, and projects Mongo's `_id` away so callers
 * only ever see the domain shape. Records are append-only: the log is a history
 * of send attempts, never edited.
 */
export class MongoWhatsAppSendLog implements WhatsAppSendLog {
  constructor(private readonly db: Db) {}

  async record(entry: WhatsAppSendRecord): Promise<void> {
    await this.db.collection(COLLECTION).insertOne({ ...entry });
  }

  async since(since: string): Promise<WhatsAppSendRecord[]> {
    const docs = await this.db
      .collection<WhatsAppSendRecord>(COLLECTION)
      .find({ sentAt: { $gte: since } }, { projection: { _id: 0 } })
      .sort({ sentAt: -1 })
      .toArray();
    return docs;
  }
}
