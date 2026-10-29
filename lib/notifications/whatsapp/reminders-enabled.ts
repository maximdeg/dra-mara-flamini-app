/**
 * Whether the daily Reminder batch sends anything. The `confirmation_reminder`
 * template is still PENDING at Meta, and sends to it are rejected until it is
 * approved, so the cron runs but sends nothing until this is on. On only when
 * the value is exactly "true". Temporary: remove it once the template is live
 * (ADR-0003).
 */
export function remindersEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.META_WHATSAPP_REMINDERS_ENABLED === "true";
}
