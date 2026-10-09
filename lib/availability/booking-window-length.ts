/**
 * Booking Window length (CONTEXT.md) — how many days ahead, counting from
 * today, Patients may book. The window always opens tomorrow; this sets where
 * it ends. One setting for every Visit Kind, picked by the Professional from
 * fixed day counts ("1 mes" is 30 days, not a calendar month). Changing it
 * only limits new bookings — existing Appointments are never affected.
 */
export const DEFAULT_BOOKING_WINDOW_DAYS = 30;

/** The lengths the Professional can pick: 14 days, then 30 to 180 by 15. */
export const BOOKING_WINDOW_LENGTH_OPTIONS: number[] = [
  14,
  ...Array.from({ length: 11 }, (_, i) => 30 + i * 15),
];

function labelFor(days: number): string {
  if (days === 14) return "2 semanas";
  const months = Math.floor(days / 30);
  const half = days % 30 === 15 ? " ½" : "";
  return `${months}${half} ${months === 1 && !half ? "mes" : "meses"}`;
}

/** The admin label for each offered length: "2 semanas", "1 mes", "1 ½ meses"… */
export const BOOKING_WINDOW_LENGTH_LABELS: Record<number, string> =
  Object.fromEntries(
    BOOKING_WINDOW_LENGTH_OPTIONS.map((days) => [days, labelFor(days)]),
  );

/**
 * Coerce an untrusted length (the editing form, or a stored document) into an
 * offered one — the trust boundary for window edits. Anything else reads as
 * the default.
 */
export function sanitizeBookingWindowLength(input: unknown): number {
  const days = Number(input);
  return BOOKING_WINDOW_LENGTH_OPTIONS.includes(days)
    ? days
    : DEFAULT_BOOKING_WINDOW_DAYS;
}
