import { SEEDED_SELF_PAY_PRICING, type SelfPayPricing } from "./deposit";
import type { SelfPayPricingRepository } from "./self-pay-pricing-repository";

/**
 * In-memory adapter at the Self-Pay pricing seam — the reference fake for tests
 * and dev. `get` returns the seeded default until pricing is saved.
 */
export class InMemorySelfPayPricingRepository
  implements SelfPayPricingRepository
{
  private pricing: SelfPayPricing | null;

  constructor(seed: SelfPayPricing | null = null) {
    this.pricing = seed;
  }

  async get(): Promise<SelfPayPricing> {
    return this.pricing ?? SEEDED_SELF_PAY_PRICING;
  }

  async save(pricing: SelfPayPricing): Promise<void> {
    this.pricing = pricing;
  }
}
