import type { Appointment, AppointmentStatus } from "./appointment";
import type { VisitType } from "./visit-type";

/**
 * A persisted-terms query for listing Appointments. Every field is optional and
 * AND-combined. Note `status` is the *persisted* status (scheduled | cancelled),
 * not the derived one — the derived Completed/Scheduled split is a function of
 * `now` and is applied above the seam by the listing module, so the
 * derived-Status rule never leaks into a persistence adapter.
 */
export interface AppointmentQuery {
  /** Inclusive lower bound on the Appointment date, "YYYY-MM-DD". */
  from?: string;
  /** Inclusive upper bound on the Appointment date, "YYYY-MM-DD". */
  to?: string;
  status?: AppointmentStatus;
  visitType?: VisitType;
}

/**
 * The repository seam.
 *
 * This interface is the only thing the Booking module (and later the
 * Cancellation and Status modules) knows about persistence. Two adapters
 * satisfy it: MongoAppointmentRepository in production, and
 * InMemoryAppointmentRepository in tests/dev. Callers and tests cross this
 * same seam, so the modules above are tested by swapping the adapter rather
 * than mocking past it.
 *
 * Later slices grow this interface as the domain needs it (e.g. finding an
 * open Appointment for a phone number, listing for the dashboard). Keep it
 * narrow: add a method only when a module actually requires it.
 */
export interface AppointmentRepository {
  create(appointment: Appointment): Promise<Appointment>;
  findById(id: string): Promise<Appointment | null>;
  /**
   * Times (`"HH:MM"`) taken by Scheduled Appointments on a given date. Used by
   * Availability to remove already-booked Time Slots. Added in slice 02 — the
   * first method the seam grew beyond the walking skeleton.
   */
  scheduledTimesOn(date: string): Promise<string[]>;
  /**
   * All Scheduled Appointments for a phone number. Booking uses this to enforce
   * the one-open-Appointment-per-phone rule (ADR-0002); "open" (Scheduled with
   * a future date) is determined by the caller. Added in slice 05.
   */
  findScheduledByPhone(phone: string): Promise<Appointment[]>;
  /**
   * Record that an Appointment's Confirmation was sent (the WhatsApp
   * bookkeeping). Added in slice 06.
   */
  markConfirmationSent(
    id: string,
    sentAt: string,
    messageId: string,
  ): Promise<void>;
  /**
   * Record that an Appointment's Confirmation email was sent (the email
   * bookkeeping, mirroring markConfirmationSent). Added in slice 35.
   */
  markEmailSent(id: string, sentAt: string, messageId: string): Promise<void>;
  /**
   * Transition an Appointment to Cancelled — the only persisted status change
   * (Completed is always derived). Added in slice 08.
   */
  markCancelled(id: string): Promise<void>;
  /**
   * Appointments matching a persisted-terms query, sorted by date then time
   * ascending. The dashboard listing crosses this seam (slice 10), as does the
   * calendar (slice 11). Derived-Status filtering happens above this method.
   */
  findAppointments(query: AppointmentQuery): Promise<Appointment[]>;
}
