import { getDb } from "../db/mongo";
import { MongoVisitDurationsRepository } from "./mongo-visit-durations-repository";
import type { VisitDurationsRepository } from "./visit-durations-repository";

/**
 * Production wiring at the Visit Durations seam. Tests construct an
 * InMemoryVisitDurationsRepository directly.
 */
export async function getVisitDurationsRepository(): Promise<VisitDurationsRepository> {
  return new MongoVisitDurationsRepository(await getDb());
}
