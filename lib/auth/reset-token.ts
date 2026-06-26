import { createHash, randomBytes } from "node:crypto";
import type { ProfessionalRepository } from "../professional/professional-repository";
import { hashPassword as defaultHashPassword } from "./password";
import type { ResetTokenRepository } from "./reset-token-repository";

/**
 * The password-recovery core: issuing and consuming a reset token, kept out of
 * the framework glue (server actions, email, NextAuth) so the security-relevant
 * decisions are unit-testable through injected dependencies.
 *
 * The emailed token is high-entropy and only ever stored as its sha256 hash;
 * resets are time-boxed and single-use; and a non-matching email yields the
 * same outward result as a matching one, so the flow never reveals whether the
 * account exists.
 */

/** How long a reset link stays valid after it is issued. */
const EXPIRY_MS = 30 * 60 * 1000;

/** sha256 the emailed token to get its stored lookup hash. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** A fresh, URL-safe, high-entropy token for the reset link. */
function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

export interface IssueResetDeps {
  professionals: Pick<ProfessionalRepository, "findByEmail">;
  tokens: ResetTokenRepository;
  now?: () => Date;
  /** Injectable token generator; defaults to crypto-random. */
  generateToken?: () => string;
}

/**
 * Issue a password-reset token for `email`. Returns the plaintext token to embed
 * in the emailed link when the email matches the (single) Professional, or null
 * when it does not — the caller emails only when a token comes back and stays
 * silent otherwise, so the outward response never reveals whether the account
 * exists. Issuing supersedes any earlier outstanding token for that account.
 *
 * Returns the Professional's canonical email alongside the token so the caller
 * sends the reset link to the stored address, not whatever casing was typed.
 */
export async function issuePasswordReset(
  email: string,
  deps: IssueResetDeps,
): Promise<{ token: string; email: string } | null> {
  const professional = await deps.professionals.findByEmail(
    email.trim().toLowerCase(),
  );
  if (!professional) {
    return null;
  }

  const token = (deps.generateToken ?? randomToken)();
  const now = (deps.now ?? (() => new Date()))();
  await deps.tokens.deleteForEmail(professional.email);
  await deps.tokens.save({
    tokenHash: hashToken(token),
    email: professional.email,
    expiresAt: new Date(now.getTime() + EXPIRY_MS).toISOString(),
    usedAt: null,
  });
  return { token, email: professional.email };
}

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; reason: "InvalidOrExpired" };

export interface ResetPasswordDeps {
  tokens: ResetTokenRepository;
  professionals: Pick<ProfessionalRepository, "updatePassword">;
  now?: () => Date;
  /** Injectable for tests; defaults to the bcrypt hasher. */
  hashPassword?: (plain: string) => Promise<string>;
}

/**
 * Consume a reset token: set the Professional's new password and burn the token.
 * Rejects a token that is unknown, already used, or past its expiry — all as the
 * same opaque `InvalidOrExpired`, so a caller cannot probe which tokens exist.
 */
export async function resetPassword(
  token: string,
  newPassword: string,
  deps: ResetPasswordDeps,
): Promise<ResetPasswordResult> {
  const record = await deps.tokens.findByHash(hashToken(token));
  const now = (deps.now ?? (() => new Date()))();
  if (
    !record ||
    record.usedAt !== null ||
    new Date(record.expiresAt).getTime() <= now.getTime()
  ) {
    return { ok: false, reason: "InvalidOrExpired" };
  }

  const hash = deps.hashPassword ?? defaultHashPassword;
  await deps.professionals.updatePassword(record.email, await hash(newPassword));
  await deps.tokens.markUsed(record.tokenHash, now.toISOString());
  return { ok: true };
}
