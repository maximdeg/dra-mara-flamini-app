import type { Professional, ProfessionalProfile } from "./professional";
import type { ProfessionalRepository } from "./professional-repository";

/**
 * In-memory adapter at the Professional repository seam — the reference fake for
 * tests and local dev. Optionally seeded at construction so a test can stand up
 * a known Professional. Production uses MongoProfessionalRepository.
 */
export class InMemoryProfessionalRepository implements ProfessionalRepository {
  private readonly byEmail = new Map<string, Professional>();

  constructor(seed: Professional[] = []) {
    for (const professional of seed) {
      this.byEmail.set(professional.email, professional);
    }
  }

  async findByEmail(email: string): Promise<Professional | null> {
    return this.byEmail.get(email) ?? null;
  }

  async upsert(professional: Professional): Promise<Professional> {
    this.byEmail.set(professional.email, professional);
    return professional;
  }

  async updateProfile(
    email: string,
    profile: ProfessionalProfile,
  ): Promise<void> {
    const professional = this.byEmail.get(email);
    if (professional) {
      this.byEmail.set(email, { ...professional, ...profile });
    }
  }

  async updatePassword(email: string, passwordHash: string): Promise<void> {
    const professional = this.byEmail.get(email);
    if (professional) {
      this.byEmail.set(email, { ...professional, passwordHash });
    }
  }
}
