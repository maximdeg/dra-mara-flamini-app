import type { ClinicInfo } from "./clinic-info";

/**
 * The clinic-info persistence seam. A single document holding the editable
 * confirmation-page copy; `get()` falls back to the seeded default until the
 * Professional saves an edit.
 */
export interface ClinicInfoRepository {
  get(): Promise<ClinicInfo>;
  save(info: ClinicInfo): Promise<void>;
}
