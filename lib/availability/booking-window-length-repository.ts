/**
 * The Booking Window length persistence seam — a single settings document.
 * `get` returns the default (30 days) until the Professional first saves. Two
 * adapters satisfy it: Mongo in production, in-memory in tests/dev.
 */
export interface BookingWindowLengthRepository {
  get(): Promise<number>;
  save(days: number): Promise<void>;
}
