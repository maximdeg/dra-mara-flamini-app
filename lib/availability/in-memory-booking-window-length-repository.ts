import { DEFAULT_BOOKING_WINDOW_DAYS } from "./booking-window-length";
import type { BookingWindowLengthRepository } from "./booking-window-length-repository";

/**
 * In-memory adapter at the Booking Window length seam — the reference fake for
 * tests and dev. `get` returns the default until a length is saved, matching
 * the Mongo adapter.
 */
export class InMemoryBookingWindowLengthRepository implements BookingWindowLengthRepository {
  private days: number | null;

  constructor(seed: number | null = null) {
    this.days = seed;
  }

  async get(): Promise<number> {
    return this.days ?? DEFAULT_BOOKING_WINDOW_DAYS;
  }

  async save(days: number): Promise<void> {
    this.days = days;
  }
}
