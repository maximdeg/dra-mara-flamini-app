import type { Db } from "mongodb";
import { SEEDED_HEALTH_INSURANCES, type HealthInsurance } from "./coverage";
import type { HealthInsuranceRepository } from "./health-insurance-repository";

const COLLECTION = "healthInsurances";
const KEY = "singleton";

/**
 * MongoDB adapter at the Health Insurance seam — the accepted-insurer list lives
 * in one document keyed by a fixed `key`. Until it exists, `list` returns the
 * seeded default so the booking coverage picker is populated before the first
 * edit.
 */
export class MongoHealthInsuranceRepository
  implements HealthInsuranceRepository
{
  constructor(private readonly db: Db) {}

  async list(): Promise<HealthInsurance[]> {
    const doc = await this.db.collection(COLLECTION).findOne({ key: KEY });
    return (
      (doc?.insurances as HealthInsurance[] | undefined) ??
      SEEDED_HEALTH_INSURANCES
    );
  }

  async save(insurances: HealthInsurance[]): Promise<void> {
    await this.db
      .collection(COLLECTION)
      .updateOne({ key: KEY }, { $set: { insurances } }, { upsert: true });
  }
}
