import type { Db } from "mongodb";
import type { UnavailableDaysRepository } from "./unavailable-days-repository";

const COLLECTION = "unavailableDays";

/**
 * MongoDB adapter at the Unavailable Days seam — one document per blocked date
 * (`{ date }`). `add` is idempotent via an upsert on the date.
 */
export class MongoUnavailableDaysRepository
  implements UnavailableDaysRepository
{
  constructor(private readonly db: Db) {}

  async list(): Promise<string[]> {
    const docs = await this.db
      .collection<{ date: string }>(COLLECTION)
      .find({}, { projection: { _id: 0, date: 1 } })
      .sort({ date: 1 })
      .toArray();
    return docs.map((doc) => doc.date);
  }

  async add(date: string): Promise<void> {
    await this.db
      .collection(COLLECTION)
      .updateOne({ date }, { $setOnInsert: { date } }, { upsert: true });
  }

  async remove(date: string): Promise<void> {
    await this.db.collection(COLLECTION).deleteOne({ date });
  }
}
