import type { HealthInsurance } from "./coverage";

/**
 * The Health Insurance persistence seam (slice 15). The accepted-insurer list is
 * a single document — `list()` returns it (or the seeded default until the
 * Professional first saves), `save()` replaces it whole. CRUD is done above the
 * seam via the pure list transforms in coverage.ts, so deleting every insurer
 * persists an empty list rather than resurrecting the seed.
 */
export interface HealthInsuranceRepository {
  list(): Promise<HealthInsurance[]>;
  save(insurances: HealthInsurance[]): Promise<void>;
}
