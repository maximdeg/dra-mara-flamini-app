import type { Db } from "mongodb";
import { SEEDED_CLINIC_INFO, type ClinicInfo } from "./clinic-info";
import type { ClinicInfoRepository } from "./clinic-info-repository";

const COLLECTION = "clinicInfo";
const KEY = "singleton";

/**
 * MongoDB adapter at the clinic-info seam — one document keyed by a fixed
 * `key`. Until it exists, `get` returns the seeded default so the confirmation
 * page renders before the first copy edit.
 */
export class MongoClinicInfoRepository implements ClinicInfoRepository {
  constructor(private readonly db: Db) {}

  async get(): Promise<ClinicInfo> {
    const doc = await this.db.collection(COLLECTION).findOne({ key: KEY });
    return (doc?.info as ClinicInfo | undefined) ?? SEEDED_CLINIC_INFO;
  }

  async save(info: ClinicInfo): Promise<void> {
    await this.db
      .collection(COLLECTION)
      .updateOne({ key: KEY }, { $set: { info } }, { upsert: true });
  }
}
