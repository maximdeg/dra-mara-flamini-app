import { randomUUID } from "node:crypto";
import type { BookingDateTimeStatus } from "../availability/availability";
import {
  isCoverageValidForVisitType,
  type HealthInsurance,
} from "../coverage/coverage";
import { depositAmountFor, type SelfPayPricing } from "../deposit/deposit";
import type { Appointment, BookingForm } from "./appointment";
import type { AppointmentRepository } from "./appointment-repository";
import { statusOf } from "./status";
import type { ConsultType, PracticeType } from "./visit-type";

/**
 * Why a booking was refused. A typed set covering both an inconsistent form and
 * external constraints, all surfaced through the same `book()` interface.
 */
export type BookingRejection =
  | "MissingConsultType"
  | "MissingPracticeType"
  | "InvalidCoverageForVisitType"
  | "DepositNotAcknowledged"
  | "PhoneHasOpenAppointment"
  | "OutsideBookingWindow"
  | "SlotTaken";

/**
 * Whether a phone already holds an open Appointment (ADR-0002). "Open" is the
 * derived Appointment Status being Scheduled — i.e. Scheduled and not yet
 * Completed — so a past (now Completed) Appointment does not block re-booking.
 */
export function phoneHasOpenAppointment(
  scheduled: Appointment[],
  now: Date,
): boolean {
  return scheduled.some(
    (appointment) => statusOf(appointment, now) === "scheduled",
  );
}

export type BookingResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; rejection: BookingRejection };

/**
 * Dependencies the Booking module needs, accepted rather than created so it is
 * testable through its interface (repository swapped for the in-memory fake;
 * id/clock injectable). The accepted Health Insurance list is passed in so
 * coverage can be validated server-side; it is seeded now and Professional-
 * managed from slice 15.
 */
export interface BookingDependencies {
  repository: AppointmentRepository;
  acceptedHealthInsurances: HealthInsurance[];
  selfPayPricing: SelfPayPricing;
  /** Classify the chosen date/time against the Booking Window and Time Slots. */
  classifyDateTime: (
    date: string,
    time: string,
  ) => Promise<BookingDateTimeStatus> | BookingDateTimeStatus;
  /** Whether this phone already holds an open Appointment (ADR-0002). */
  hasOpenAppointmentForPhone: (phone: string) => Promise<boolean> | boolean;
  /** Send the Confirmation for a booked Appointment (called best-effort). */
  notifyConfirmation: (appointment: Appointment) => Promise<void> | void;
  /** Send the Confirmation email for a booked Appointment (called best-effort). */
  sendConfirmationEmail: (appointment: Appointment) => Promise<void> | void;
  generateId?: () => string;
  now?: () => Date;
}

interface SubType {
  consultType: ConsultType | null;
  practiceType: PracticeType | null;
}

/**
 * Booking — the deepest module in the system, and the only writer of new
 * Appointments.
 *
 * It validates that the form is internally consistent (required sub-type
 * present, the other normalized away; coverage valid for the Visit Type;
 * Deposit acknowledged when one applies), then enforces external constraints
 * (the one-open-Appointment-per-phone rule and date/time availability), and
 * finally persists a Scheduled Appointment. Returning a result union (not
 * throwing) keeps every refusal an explicit, typed outcome. Enqueueing a
 * Confirmation (slice 06) is the remaining behavior to layer behind this
 * interface.
 */
export async function book(
  form: BookingForm,
  deps: BookingDependencies,
): Promise<BookingResult> {
  let subType: SubType;
  if (form.visitType === "Consultation") {
    if (!form.consultType) {
      return { ok: false, rejection: "MissingConsultType" };
    }
    subType = { consultType: form.consultType, practiceType: null };
  } else {
    if (!form.practiceType) {
      return { ok: false, rejection: "MissingPracticeType" };
    }
    subType = { consultType: null, practiceType: form.practiceType };
  }

  if (
    !isCoverageValidForVisitType(
      form.coverage,
      form.visitType,
      deps.acceptedHealthInsurances,
    )
  ) {
    return { ok: false, rejection: "InvalidCoverageForVisitType" };
  }

  const depositAmount = depositAmountFor(
    {
      visitType: form.visitType,
      consultType: subType.consultType,
      coverage: form.coverage,
    },
    deps.selfPayPricing,
  );
  if (depositAmount !== null && !form.depositAcknowledged) {
    return { ok: false, rejection: "DepositNotAcknowledged" };
  }
  const deposit =
    depositAmount !== null
      ? { amount: depositAmount, acknowledged: true }
      : null;

  if (await deps.hasOpenAppointmentForPhone(form.patientPhone)) {
    return { ok: false, rejection: "PhoneHasOpenAppointment" };
  }

  const dateTime = await deps.classifyDateTime(form.date, form.time);
  if (dateTime === "outside-window") {
    return { ok: false, rejection: "OutsideBookingWindow" };
  }
  if (dateTime === "slot-taken") {
    return { ok: false, rejection: "SlotTaken" };
  }

  const generateId = deps.generateId ?? randomUUID;
  const now = deps.now ?? (() => new Date());

  const appointment: Appointment = {
    id: generateId(),
    patientFirstName: form.patientFirstName,
    patientLastName: form.patientLastName,
    patientPhone: form.patientPhone,
    patientEmail: form.patientEmail,
    visitType: form.visitType,
    consultType: subType.consultType,
    practiceType: subType.practiceType,
    coverage: form.coverage,
    deposit,
    date: form.date,
    time: form.time,
    status: "scheduled",
    whatsappSent: false,
    whatsappSentAt: null,
    whatsappMessageId: null,
    emailSent: false,
    emailSentAt: null,
    emailMessageId: null,
    createdAt: now().toISOString(),
  };

  const created = await deps.repository.create(appointment);

  // Best-effort, decoupled (ADR-0001): a Notification failure never costs the
  // Patient their Appointment.
  try {
    await deps.notifyConfirmation(created);
  } catch {
    // swallowed on purpose
  }

  // The Confirmation email is an independent best-effort channel — its failure
  // (or missing mail config) must likewise never cost the Appointment.
  try {
    await deps.sendConfirmationEmail(created);
  } catch {
    // swallowed on purpose
  }

  return { ok: true, appointment: created };
}
