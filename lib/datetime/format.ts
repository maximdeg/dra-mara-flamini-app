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
