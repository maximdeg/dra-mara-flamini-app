import { SEEDED_CLINIC_INFO, type ClinicInfo } from "./clinic-info";
import type { ClinicInfoRepository } from "./clinic-info-repository";

/**
 * In-memory adapter at the clinic-info seam — the reference fake for tests and
 * dev. `get` returns the seeded default until clinic info is saved.
 */
export class InMemoryClinicInfoRepository implements ClinicInfoRepository {
  private info: ClinicInfo | null;

  constructor(seed: ClinicInfo | null = null) {
    this.info = seed;
  }

  async get(): Promise<ClinicInfo> {
    return this.info ?? SEEDED_CLINIC_INFO;
  }

  async save(info: ClinicInfo): Promise<void> {
    this.info = info;
  }
}
