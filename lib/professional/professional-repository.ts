import type { Professional, ProfessionalProfile } from "./professional";

/**
 * The Professional repository seam.
 *
 * Mirrors the Appointment repository seam: the only thing the auth modules know
 * about persistence. Two adapters satisfy it — MongoProfessionalRepository in
 * production, InMemoryProfessionalRepository in tests/dev. Credential
 * verification crosses this seam, so it is tested by swapping the adapter rather
 * than mocking past it.
 *
 * Kept narrow: `findByEmail` for sign-in and `upsert` for the seed script. Slice
 * 12 (profile + change password) grows it with the update methods it needs.
 */
export interface ProfessionalRepository {
  /** The Professional for a login email, or null if none matches. */
  findByEmail(email: string): Promise<Professional | null>;
  /**
   * Insert or replace the single Professional (keyed by email). Used by the
   * seed script; there is exactly one Professional per deployment.
   */
  upsert(professional: Professional): Promise<Professional>;
  /** Update the editable profile fields, leaving credentials untouched (slice 12). */
  updateProfile(email: string, profile: ProfessionalProfile): Promise<void>;
  /** Replace the stored password hash (slice 12). */
  updatePassword(email: string, passwordHash: string): Promise<void>;
}
