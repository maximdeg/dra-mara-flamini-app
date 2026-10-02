import type { Db } from "mongodb";
import {
  sanitizeSelfPayPricing,
  SEEDED_SELF_PAY_PRICING,
  type SelfPayPricing,
} from "./deposit";
import type { SelfPayPricingRepository } from "./self-pay-pricing-repository";

const COLLECTION = "selfPayPricing";
const KEY = "singleton";

/**
 * MongoDB adapter at the Self-Pay pricing seam — one document keyed by a fixed
 * `key`. Until it exists, `get` returns the seeded default so Deposit
 * determination works before the first price edit.
 */
export class MongoSelfPayPricingRepository
  implements SelfPayPricingRepository
{
  constructor(private readonly db: Db) {}

  async get(): Promise<SelfPayPricing> {
    const doc = await this.db.collection(COLLECTION).findOne({ key: KEY });
    // Read through the sanitizer so settings saved before Coverage
    // Instructions existed come back with empty ones (no migration).
    return doc?.pricing
      ? sanitizeSelfPayPricing(doc.pricing)
      : SEEDED_SELF_PAY_PRICING;
  }

  async save(pricing: SelfPayPricing): Promise<void> {
    await this.db
      .collection(COLLECTION)
      .updateOne({ key: KEY }, { $set: { pricing } }, { upsert: true });
  }
}
