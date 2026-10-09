import type { Db } from "mongodb";
import {
  DEFAULT_BOOKING_WINDOW_DAYS,
  sanitizeBookingWindowLength,
} from "./booking-window-length";
import type { BookingWindowLengthRepository } from "./booking-window-length-repository";

const COLLECTION = "bookingWindowLength";
const KEY = "singleton";

/**
 * MongoDB adapter at the Booking Window length seam — one document keyed by a
 * fixed `key`. Until it exists, `get` returns the default; a stored value is
 * read through the sanitizer so one no longer offered reads as the default.
 */
export class MongoBookingWindowLengthRepository implements BookingWindowLengthRepository {
  constructor(private readonly db: Db) {}

  async get(): Promise<number> {
    const doc = await this.db.collection(COLLECTION).findOne({ key: KEY });
    return doc?.days !== undefined
      ? sanitizeBookingWindowLength(doc.days)
      : DEFAULT_BOOKING_WINDOW_DAYS;
  }

  async save(days: number): Promise<void> {
    await this.db
      .collection(COLLECTION)
      .updateOne({ key: KEY }, { $set: { days } }, { upsert: true });
  }
}
