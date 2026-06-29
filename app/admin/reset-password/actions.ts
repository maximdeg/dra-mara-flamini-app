"use server";

import { getResetTokenRepository } from "@/lib/auth/get-reset-token-repository";
import { resetPassword } from "@/lib/auth/reset-token";
import { getProfessionalRepository } from "@/lib/professional/get-professional-repository";
import type { ResetPasswordState } from "./types";

/** Minimum length for a freshly set password. */
const MIN_LENGTH = 8;

/**
 * Step 2 of password recovery: set the new password using the token from the
 * emailed link. An invalid, used, or expired token (and any other failure) is
 * reported as one opaque message, so the page cannot be used to probe tokens.
 */
export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword.length < MIN_LENGTH) {
    return {
      error: `La contraseña debe tener al menos ${MIN_LENGTH} caracteres.`,
    };
  }

  const result = await resetPassword(token, newPassword, {
    tokens: await getResetTokenRepository(),
    professionals: await getProfessionalRepository(),
  });
  if (!result.ok) {
    return { error: "El enlace no es válido o expiró. Pedí uno nuevo." };
  }
  return { ok: true };
}
