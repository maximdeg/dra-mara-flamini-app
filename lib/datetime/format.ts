/**
 * Date display for the Argentine user. The app stores plain calendar dates as
 * `YYYY-MM-DD` and times as 24-hour `HH:MM` strings; Argentina reads dates as
 * `DD/MM/YYYY` and times in 24-hour form (times already render correctly, so
 * only dates need reshaping). A single helper keeps the Patient flow, the
 * Professional's Panel, and the email notifications consistent — the same
 * one-formatter approach as `formatPesos` (es-AR).
 */

/**
 * Format a plain `YYYY-MM-DD` calendar date as Argentine `DD/MM/YYYY`.
 *
 * Operates on the string directly rather than parsing a `Date`, so it never
 * shifts a day across time zones — the stored value is a wall-calendar date, not
 * an instant. A value that isn't a well-formed `YYYY-MM-DD` is returned
 * unchanged, so a malformed date degrades to its raw text instead of throwing.
 */
export function formatDateAR(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    return iso;
  }
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/**
 * An Appointment's span as `HH:MM–HH:MM`: its start and the end its duration
 * reaches. Same-day only — the Booking Window never offers a start that would
 * cross midnight.
 */
export function formatTimeRange(
  start: string,
  durationMinutes: number,
): string {
  const [h, m] = start.split(":").map(Number);
  const end = h * 60 + m + durationMinutes;
  const hh = String(Math.floor(end / 60)).padStart(2, "0");
  const mm = String(end % 60).padStart(2, "0");
  return `${start}–${hh}:${mm}`;
}
