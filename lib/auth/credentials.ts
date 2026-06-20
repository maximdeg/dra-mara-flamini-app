import type { Professional } from "../professional/professional";
import type { ProfessionalRepository } from "../professional/professional-repository";
import { verifyPassword } from "./password";

export interface CredentialDependencies {
  repository: ProfessionalRepository;
  /** Injectable for tests; defaults to the bcrypt comparison. */
  verifyPassword?: (plain: string, passwordHash: string) => Promise<boolean>;
}

/**
 * Verify Professional sign-in credentials — the deep, testable core of auth that
 * the NextAuth Credentials provider delegates to (`authorize`). Returns the
 * Professional on a match, or null for an unknown email or wrong password
 * (callers must not distinguish the two). Email is normalized to match how it is
 * stored.
 */
export async function verifyProfessionalCredentials(
  email: string,
  password: string,
  deps: CredentialDependencies,
): Promise<Professional | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return null;
  }

  const professional = await deps.repository.findByEmail(normalizedEmail);
  if (!professional) {
    return null;
  }

  const verify = deps.verifyPassword ?? verifyPassword;
  const matches = await verify(password, professional.passwordHash);
  return matches ? professional : null;
}
