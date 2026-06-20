import { getDb } from "../db/mongo";
import type { ProfessionalRepository } from "./professional-repository";
import { MongoProfessionalRepository } from "./mongo-professional-repository";

/**
 * Production wiring at the Professional repository seam. The single place that
 * decides which adapter the running app uses. Tests never call this — they
 * construct an InMemoryProfessionalRepository directly.
 */
export async function getProfessionalRepository(): Promise<ProfessionalRepository> {
  const db = await getDb();
  return new MongoProfessionalRepository(db);
}
