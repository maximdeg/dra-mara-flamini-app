import { getDb } from "../db/mongo";
import type { ResetTokenRepository } from "./reset-token-repository";
import { MongoResetTokenRepository } from "./mongo-reset-token-repository";

/**
 * Production wiring at the reset-token seam. The single place that decides which
 * adapter the running app uses. Tests never call this — they construct an
 * InMemoryResetTokenRepository directly.
 */
export async function getResetTokenRepository(): Promise<ResetTokenRepository> {
  const db = await getDb();
  return new MongoResetTokenRepository(db);
}
