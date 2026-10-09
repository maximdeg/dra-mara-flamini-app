import { getDb } from "../db/mongo";
import type { BookingWindowLengthRepository } from "./booking-window-length-repository";
import { MongoBookingWindowLengthRepository } from "./mongo-booking-window-length-repository";

/**
 * Production wiring at the Booking Window length seam. Tests construct an
 * InMemoryBookingWindowLengthRepository directly.
 */
export async function getBookingWindowLengthRepository(): Promise<BookingWindowLengthRepository> {
  return new MongoBookingWindowLengthRepository(await getDb());
}
