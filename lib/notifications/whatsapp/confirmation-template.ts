/**
 * Whether the approved Confirmation template carries Coverage Instructions —
 * the 7-parameter body ({{6}} indicaciones, {{7}} enlace) instead of today's
 * six. The Professional edited `appointment_confirmation_1` in Meta and the
 * edit awaits review, so this stays off until it is approved: sending seven
 * parameters to the 6-placeholder template (or six to the 7-placeholder one)
 * is rejected with error 100. On only when exactly "true"; temporary — removed
 * once the 7-parameter template is live (ADR-0003).
 */
export function confirmationIncludesInstructions(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.META_WHATSAPP_CONFIRMATION_WITH_INSTRUCTIONS === "true";
}
