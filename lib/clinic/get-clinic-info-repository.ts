import { getDb } from "../db/mongo";
import type { ClinicInfoRepository } from "./clinic-info-repository";
import { MongoClinicInfoRepository } from "./mongo-clinic-info-repository";

/**
 * Production wiring at the clinic-info seam. Tests construct an
 * InMemoryClinicInfoRepository directly.
 */
export async function getClinicInfoRepository(): Promise<ClinicInfoRepository> {
  return new MongoClinicInfoRepository(await getDb());
}
