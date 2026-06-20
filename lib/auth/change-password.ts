import type { ProfessionalRepository } from "../professional/professional-repository";
import {
  hashPassword as defaultHashPassword,
  verifyPassword as defaultVerifyPassword,
} from "./password";

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; reason: "NotFound" | "WrongCurrentPassword" };

export interface ChangePasswordDependencies {
  repository: Pick<ProfessionalRepository, "findByEmail" | "updatePassword">;
  /** Injectable for tests; default to the bcrypt implementations. */
  verifyPassword?: (plain: string, passwordHash: string) => Promise<boolean>;
  hashPassword?: (plain: string) => Promise<string>;
}

/**
 * Change the Professional's password — the deep, testable core behind the
 * dashboard form. Requires the correct current password (verified against the
 * stored hash) before the new one is hashed and persisted; a wrong current
 * password leaves the stored hash untouched. The plaintext is never stored.
 */
export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string,
  deps: ChangePasswordDependencies,
): Promise<ChangePasswordResult> {
  const professional = await deps.repository.findByEmail(
    email.trim().toLowerCase(),
  );
  if (!professional) {
    return { ok: false, reason: "NotFound" };
  }

  const verify = deps.verifyPassword ?? defaultVerifyPassword;
  if (!(await verify(currentPassword, professional.passwordHash))) {
    return { ok: false, reason: "WrongCurrentPassword" };
  }

  const hash = deps.hashPassword ?? defaultHashPassword;
  await deps.repository.updatePassword(
    professional.email,
    await hash(newPassword),
  );
  return { ok: true };
}
