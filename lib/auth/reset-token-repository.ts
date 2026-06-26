/**
 * A pending password-reset token for the single Professional account.
 *
 * Only the sha256 hash of the token is stored — the plaintext lives solely in
 * the emailed link, so a leaked database row cannot be turned into a password
 * reset. A token is single-use (`usedAt`) and time-boxed (`expiresAt`).
 */
export interface PasswordResetToken {
  /** sha256 hex hash of the emailed token — the lookup key. */
  tokenHash: string;
  /** The Professional's email this reset belongs to. */
  email: string;
  /** ISO timestamp after which the token no longer works. */
  expiresAt: string;
  /** ISO timestamp when the token was consumed, or null while still usable. */
  usedAt: string | null;
}

/**
 * The reset-token repository seam — mirrors the Professional/Appointment seams.
 * Two adapters satisfy it: MongoResetTokenRepository in production and
 * InMemoryResetTokenRepository in tests/dev.
 */
export interface ResetTokenRepository {
  /** Persist a freshly issued token. */
  save(token: PasswordResetToken): Promise<void>;
  /** The token record for a hash, or null if none matches. */
  findByHash(tokenHash: string): Promise<PasswordResetToken | null>;
  /** Mark a token consumed, so it cannot be used again. */
  markUsed(tokenHash: string, usedAt: string): Promise<void>;
  /** Drop any outstanding tokens for an email — a new issue supersedes them. */
  deleteForEmail(email: string): Promise<void>;
}
