import { getDb } from "../db/mongo";
import type { AppointmentRepository } from "./appointment-repository";
import { MongoAppointmentRepository } from "./mongo-appointment-repository";

/**
 * Production wiring at the repository seam: hand route handlers and pages a
 * MongoDB-backed repository. Tests never call this — they construct an
 * InMemoryAppointmentRepository directly. This is the single place that decides
 * which adapter the running app uses.
 */
export async function getAppointmentRepository(): Promise<AppointmentRepository> {
  const db = await getDb();
  return new MongoAppointmentRepository(db);
}
