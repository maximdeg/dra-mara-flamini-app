import { getDb } from "../db/mongo";
import { MongoSelfPayPricingRepository } from "./mongo-self-pay-pricing-repository";
import type { SelfPayPricingRepository } from "./self-pay-pricing-repository";

/**
 * Production wiring at the Self-Pay pricing seam. Tests construct an
 * InMemorySelfPayPricingRepository directly.
 */
export async function getSelfPayPricingRepository(): Promise<SelfPayPricingRepository> {
  return new MongoSelfPayPricingRepository(await getDb());
}
