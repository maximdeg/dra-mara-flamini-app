/**
 * The Appointment — the central entity of the domain (see CONTEXT.md).
 *
 * Per ADR-0002 there is no Patient entity: the Patient's identification lives
 * on each Appointment, re-entered for every booking.
 *
 * Persisted Status is only "scheduled" or "cancelled". "Completed" is never
 * stored — it is derived once an Appointment's date has passed (a later slice
 * introduces the Appointment Status module). That is why this type does not
 * include a "completed" value.
 */
import type { Coverage } from "../coverage/coverage";
import type { Deposit } from "../deposit/deposit";
import type { ConsultType, PracticeType, VisitType } from "./visit-type";

export type AppointmentStatus = "scheduled" | "cancelled";

export interface Appointment {
  id: string;
  /** Patient identification, captured on the booking form (ADR-0002). */
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  patientEmail: string;
  /** What the Appointment is for, and its required sub-type. */
  visitType: VisitType;
  consultType: ConsultType | null;
  practiceType: PracticeType | null;
  /** The chosen Health Insurance or Self-Pay variant. */
  coverage: Coverage;
  /** The acknowledged Deposit, or null when none applies. */
  deposit: Deposit | null;
  /** ISO calendar date, "YYYY-MM-DD". */
  date: string;
  /** 24-hour time of the Time Slot, "HH:MM". */
  time: string;
  status: AppointmentStatus;
  /**
   * Confirmation (WhatsApp) bookkeeping, denormalized onto the Appointment for
   * the dashboard. Set false/null at booking; updated when the Confirmation is
   * sent. The outbox is the source of truth per Notification.
   */
  whatsappSent: boolean;
  whatsappSentAt: string | null;
  whatsappMessageId: string | null;
  /**
   * Confirmation email bookkeeping, denormalized onto the Appointment exactly
   * like the WhatsApp fields above. Set false/null at booking; updated when the
   * Confirmation email is sent (slice 35).
   */
  emailSent: boolean;
  emailSentAt: string | null;
  emailMessageId: string | null;
  /**
   * The Patient's consent to be contacted on WhatsApp, captured on the booking
   * form. Meta requires opt-in before a business sends a template to a number,
   * so this records that it was given: `null` means no consent (the Patient
   * unticked it), otherwise the ISO instant they agreed. Kept as a timestamp
   * rather than a boolean so it is evidence of when consent was obtained.
   *
   * Appointments booked before this field existed read as `undefined`; treat
   * that as legacy-consented rather than refused (see whatsappConsentGiven).
   */
  whatsappConsentAt?: string | null;
  /** ISO timestamp of when the booking was created. */
  createdAt: string;
}

/**
 * What a Patient submits to book an Appointment. The sub-type not required by
 * the Visit Type may be omitted — Booking normalizes it to null. Later slices
 * add Deposit acknowledgment to this form.
 */
export interface BookingForm {
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  patientEmail: string;
  visitType: VisitType;
  consultType?: ConsultType | null;
  practiceType?: PracticeType | null;
  coverage: Coverage;
  /** Whether the Patient acknowledged the Deposit; only checked when one applies. */
  depositAcknowledged?: boolean;
  /**
   * Whether the Patient agreed to be contacted on WhatsApp. Defaults to true
   * when absent so an API client that predates the checkbox keeps working; the
   * form always sends it explicitly.
   */
  whatsappConsent?: boolean;
  date: string;
  time: string;
}
