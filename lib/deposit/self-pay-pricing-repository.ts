import type { SelfPayPricing } from "./deposit";

/**
 * The Self-Pay pricing persistence seam (slice 15). A single document holding
 * the two editable Self-Pay prices and the First-Visit Consultation Deposit
 * amount; `get()` falls back to the seeded default until first saved. The
 * Self-Pay variants themselves are fixed in code — only these amounts vary.
 */
export interface SelfPayPricingRepository {
  get(): Promise<SelfPayPricing>;
  save(pricing: SelfPayPricing): Promise<void>;
}
