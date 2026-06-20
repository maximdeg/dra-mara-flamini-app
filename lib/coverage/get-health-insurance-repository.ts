import { getDb } from "../db/mongo";
import type { HealthInsuranceRepository } from "./health-insurance-repository";
import { MongoHealthInsuranceRepository } from "./mongo-health-insurance-repository";

/**
 * Production wiring at the Health Insurance seam. Tests construct an
 * InMemoryHealthInsuranceRepository directly.
 */
export async function getHealthInsuranceRepository(): Promise<HealthInsuranceRepository> {
  return new MongoHealthInsuranceRepository(await getDb());
}
