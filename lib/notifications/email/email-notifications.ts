/**
 * Whether Patient email notifications — the Confirmation email and the
 * Cancellation email — are sent. The client asked for them to stop while the
 * code stays in place, so they are off unless `EMAIL_NOTIFICATIONS_ENABLED` is
 * exactly "true"; turning them back on is an env change, not a code change.
 *
 * Patient Notifications only: the Professional's password-reset email is an
 * auth flow and always sends, regardless of this flag.
 */
export function emailNotificationsEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.EMAIL_NOTIFICATIONS_ENABLED === "true";
}

/**
 * The email channel a composition root hands to Booking or Cancellation: the
 * real send when enabled, otherwise a no-op. Choosing here — rather than inside
 * `book()`/`cancel()` — keeps the domain interfaces unchanged, and a disabled
 * channel never builds the Gmail sender at all.
 */
export function gateEmailChannel<Args extends unknown[]>(
  enabled: boolean,
  send: (...args: Args) => Promise<void>,
): (...args: Args) => Promise<void> {
  return enabled ? send : async () => {};
}
