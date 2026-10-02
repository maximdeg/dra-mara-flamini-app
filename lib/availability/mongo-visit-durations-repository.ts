import type { Db } from "mongodb";
import {
  DEFAULT_VISIT_DURATIONS,
  sanitizeVisitDurations,
  type VisitDurations,
} from "./visit-durations";
import type { VisitDurationsRepository } from "./visit-durations-repository";

const COLLECTION = "visitDurations";
const KEY = "singleton";

/**
 * MongoDB adapter at the Visit Durations seam — one document keyed by a fixed
 * `key`. Until it exists, `get` returns the defaults; stored values are read
 * through the sanitizer so a kind added later reads as the default.
 */
export class MongoVisitDurationsRepository implements VisitDurationsRepository {
  constructor(private readonly db: Db) {}

  async get(): Promise<VisitDurations> {
    const doc = await this.db.collection(COLLECTION).findOne({ key: KEY });
    return doc?.durations
      ? sanitizeVisitDurations(doc.durations)
      : DEFAULT_VISIT_DURATIONS;
  }

  async save(durations: VisitDurations): Promise<void> {
    await this.db
      .collection(COLLECTION)
      .updateOne({ key: KEY }, { $set: { durations } }, { upsert: true });
  }
}
