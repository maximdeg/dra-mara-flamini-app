import type { Db } from "mongodb";
import { DEFAULT_WORK_SCHEDULE, type WorkSchedule } from "./work-schedule";
import type { WorkScheduleRepository } from "./work-schedule-repository";

const COLLECTION = "workSchedule";
const KEY = "singleton";

/**
 * MongoDB adapter at the Work Schedule seam — the single weekly schedule lives
 * in one document keyed by a fixed `key`. Until that document exists, `get`
 * returns the seeded default so Availability is unchanged before the first edit.
 */
export class MongoWorkScheduleRepository implements WorkScheduleRepository {
  constructor(private readonly db: Db) {}

  async get(): Promise<WorkSchedule> {
    const doc = await this.db.collection(COLLECTION).findOne({ key: KEY });
    return (doc?.schedule as WorkSchedule | undefined) ?? DEFAULT_WORK_SCHEDULE;
  }

  async save(schedule: WorkSchedule): Promise<void> {
    await this.db
      .collection(COLLECTION)
      .updateOne({ key: KEY }, { $set: { schedule } }, { upsert: true });
  }
}
