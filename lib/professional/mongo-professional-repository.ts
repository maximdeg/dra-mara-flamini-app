import type { Db } from "mongodb";
import type { Professional, ProfessionalProfile } from "./professional";
import type { ProfessionalRepository } from "./professional-repository";

const COLLECTION = "professional";

/**
 * MongoDB adapter at the Professional repository seam — the production
 * implementation. Like the Appointment adapter it receives an already-connected
 * Db and projects Mongo's `_id` away so callers only see the domain shape.
 */
export class MongoProfessionalRepository implements ProfessionalRepository {
  constructor(private readonly db: Db) {}

  async findByEmail(email: string): Promise<Professional | null> {
    const doc = await this.db
      .collection(COLLECTION)
      .findOne({ email }, { projection: { _id: 0 } });
    return (doc as Professional | null) ?? null;
  }

  async upsert(professional: Professional): Promise<Professional> {
    await this.db
      .collection(COLLECTION)
      .updateOne(
        { email: professional.email },
        { $set: { ...professional } },
        { upsert: true },
      );
    return professional;
  }

  async updateProfile(
    email: string,
    profile: ProfessionalProfile,
  ): Promise<void> {
    await this.db.collection(COLLECTION).updateOne(
      { email },
      {
        $set: {
          name: profile.name,
          phone: profile.phone,
          whatsappNumber: profile.whatsappNumber,
        },
      },
    );
  }

  async updatePassword(email: string, passwordHash: string): Promise<void> {
    await this.db
      .collection(COLLECTION)
      .updateOne({ email }, { $set: { passwordHash } });
  }
}
