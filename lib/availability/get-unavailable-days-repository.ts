import { getDb } from "../db/mongo";
import { MongoUnavailableDaysRepository } from "./mongo-unavailable-days-repository";
import type { UnavailableDaysRepository } from "./unavailable-days-repository";

/**
 * Production wiring at the Unavailable Days seam. Tests construct an
 * InMemoryUnavailableDaysRepository directly.
 */
export async function getUnavailableDaysRepository(): Promise<UnavailableDaysRepository> {
  return new MongoUnavailableDaysRepository(await getDb());
}
