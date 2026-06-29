import type { Db } from "mongodb";
import type {
  PasswordResetToken,
  ResetTokenRepository,
} from "./reset-token-repository";

const COLLECTION = "password_reset_tokens";

/**
 * MongoDB adapter at the reset-token seam — the production implementation. Like
 * the other adapters it receives an already-connected Db and projects Mongo's
 * `_id` away so callers only see the domain shape. Keyed by `tokenHash`.
 */
export class MongoResetTokenRepository implements ResetTokenRepository {
  constructor(private readonly db: Db) {}

  async save(token: PasswordResetToken): Promise<void> {
    await this.db
      .collection(COLLECTION)
      .updateOne(
        { tokenHash: token.tokenHash },
        { $set: { ...token } },
        { upsert: true },
      );
  }

  async findByHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const doc = await this.db
      .collection(COLLECTION)
      .findOne({ tokenHash }, { projection: { _id: 0 } });
    return (doc as PasswordResetToken | null) ?? null;
  }

  async markUsed(tokenHash: string, usedAt: string): Promise<void> {
    await this.db
      .collection(COLLECTION)
      .updateOne({ tokenHash }, { $set: { usedAt } });
  }

  async deleteForEmail(email: string): Promise<void> {
    await this.db.collection(COLLECTION).deleteMany({ email });
  }
}
