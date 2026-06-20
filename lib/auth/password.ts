import { compare, hash } from "bcryptjs";

/**
 * Password hashing for the Professional's credentials.
 *
 * bcrypt (via pure-JS bcryptjs, so there is no native build step) — the
 * plaintext password is never stored, only the hash. Both the seed script and
 * the change-password flow (slice 12) hash through here; credential
 * verification compares through here.
 */
const SALT_ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, SALT_ROUNDS);
}

export function verifyPassword(
  plain: string,
  passwordHash: string,
): Promise<boolean> {
  return compare(plain, passwordHash);
}
