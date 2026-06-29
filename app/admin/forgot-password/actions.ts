"use server";

import { getResetTokenRepository } from "@/lib/auth/get-reset-token-repository";
import { issuePasswordReset } from "@/lib/auth/reset-token";
import { getEmailSender } from "@/lib/notifications/email/get-email-sender";
import { passwordResetEmail } from "@/lib/notifications/email/password-reset";
import { getProfessionalRepository } from "@/lib/professional/get-professional-repository";
import { siteUrl } from "@/lib/site-url";
import type { RequestResetState } from "./types";

/**
 * Start password recovery. Issues a reset token for the matching Professional
 * and emails the link; for any other email it silently does nothing. Either way
 * it returns the same neutral `ok`, and any token/email failure is swallowed, so
 * the response never reveals whether the account exists.
 */
export async function requestPasswordResetAction(
  _prev: RequestResetState,
  formData: FormData,
): Promise<RequestResetState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Ingresá tu email." };
  }

  try {
    const issued = await issuePasswordReset(email, {
      professionals: await getProfessionalRepository(),
      tokens: await getResetTokenRepository(),
    });
    if (issued) {
      const url = siteUrl(
        `/admin/reset-password?token=${encodeURIComponent(issued.token)}`,
      );
      await getEmailSender().send(passwordResetEmail(issued.email, url));
    }
  } catch {
    // Best-effort: never surface whether the account exists or that sending
    // failed. The Professional sees the same neutral confirmation regardless.
  }

  return { ok: true };
}
