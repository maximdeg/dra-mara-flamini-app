import type {
  PasswordResetToken,
  ResetTokenRepository,
} from "./reset-token-repository";

/**
 * In-memory adapter at the reset-token seam — the reference fake for tests and
 * local dev. Production uses MongoResetTokenRepository.
 */
export class InMemoryResetTokenRepository implements ResetTokenRepository {
  private readonly byHash = new Map<string, PasswordResetToken>();

  constructor(seed: PasswordResetToken[] = []) {
    for (const token of seed) {
      this.byHash.set(token.tokenHash, token);
    }
  }

  async save(token: PasswordResetToken): Promise<void> {
    this.byHash.set(token.tokenHash, token);
  }

  async findByHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return this.byHash.get(tokenHash) ?? null;
  }

  async markUsed(tokenHash: string, usedAt: string): Promise<void> {
    const token = this.byHash.get(tokenHash);
    if (token) {
      this.byHash.set(tokenHash, { ...token, usedAt });
    }
  }

  async deleteForEmail(email: string): Promise<void> {
    for (const [hash, token] of this.byHash) {
      if (token.email === email) {
        this.byHash.delete(hash);
      }
    }
  }
}
