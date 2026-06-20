/**
 * The Unavailable Days seam — one-off blocked dates the Professional sets
 * (CONTEXT.md). Dates are ISO "YYYY-MM-DD". Two adapters satisfy it: Mongo in
 * production, in-memory in tests/dev. Availability reads `list()` to exclude
 * these dates from the Booking Window.
 */
export interface UnavailableDaysRepository {
  /** All blocked dates, ascending. */
  list(): Promise<string[]>;
  /** Block a date (idempotent). */
  add(date: string): Promise<void>;
  /** Reopen a date. */
  remove(date: string): Promise<void>;
}
