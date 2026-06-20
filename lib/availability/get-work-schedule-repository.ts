import { getDb } from "../db/mongo";
import { MongoWorkScheduleRepository } from "./mongo-work-schedule-repository";
import type { WorkScheduleRepository } from "./work-schedule-repository";

/**
 * Production wiring at the Work Schedule seam. Tests construct an
 * InMemoryWorkScheduleRepository directly.
 */
export async function getWorkScheduleRepository(): Promise<WorkScheduleRepository> {
  return new MongoWorkScheduleRepository(await getDb());
}
