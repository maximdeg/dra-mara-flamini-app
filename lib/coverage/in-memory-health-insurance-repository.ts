import { SEEDED_HEALTH_INSURANCES, type HealthInsurance } from "./coverage";
import type { HealthInsuranceRepository } from "./health-insurance-repository";

/**
 * In-memory adapter at the Health Insurance seam — the reference fake for tests
 * and dev. `list` returns the seeded default until a list is saved (matching the
 * Mongo adapter); once saved (even empty), the saved list wins.
 */
export class InMemoryHealthInsuranceRepository
  implements HealthInsuranceRepository
{
  private insurances: HealthInsurance[] | null;

  constructor(seed: HealthInsurance[] | null = null) {
    this.insurances = seed;
  }

  async list(): Promise<HealthInsurance[]> {
    return this.insurances ?? SEEDED_HEALTH_INSURANCES;
  }

  async save(insurances: HealthInsurance[]): Promise<void> {
    this.insurances = insurances;
  }
}
