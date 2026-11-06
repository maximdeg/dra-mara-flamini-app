import { randomUUID } from "node:crypto";
import { isISODate } from "../availability/dates";
import { DURATION_OPTIONS } from "../availability/visit-durations";
import {
  coverageInstructionsFor,
  isCoverageValidForManualBooking,
  sanitizeOtherCoverageName,
  type Coverage,
  type HealthInsurance,
  type SelfPayVariant,
} from "../coverage/coverage";
import { normalizeArgentinePhone } from "../phone/phone";
import type { Appointment } from "./appointment";
import type { AppointmentRepository } from "./appointment-repository";
import {
  APPOINTMENT_PRACTICE_TYPES,
  CONSULT_TYPES,
  type AppointmentPracticeType,
  type ConsultType,
  type VisitType,
} from "./visit-type";

/**
 * What the Professional enters on the manual scheduler (Agendar turno). Unlike
 * the online BookingForm it carries its own duration and allows Plasma, and
 * has no email or Deposit acknowledgment.
 */
export interface ManualBookingForm {
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  visitType: VisitType;
  consultType?: ConsultType | null;
  practiceType?: AppointmentPracticeType | null;
  coverage: Coverage;
  /** ISO calendar date, "YYYY-MM-DD" — any date, past ones included. */
  date: string;
  /** 24-hour start time, "HH:MM" — any time. */
  time: string;
  durationMinutes: number;
  /** Whether the Patient agreed to be contacted on WhatsApp. */
  whatsappConsent: boolean;
}

/** Why the manual scheduler refused an entry. */
export type ManualBookingRejection =
  | "MissingName"
  | "InvalidPhone"
  | "MissingConsultType"
  | "MissingPracticeType"
  | "InvalidDate"
  | "InvalidTime"
  | "InvalidDuration"
  | "OverrunsMidnight"
  | "InvalidCoverage"
  | "SlotTaken";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const MINUTES_PER_DAY = 24 * 60;

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

interface SubType {
  consultType: ConsultType | null;
  practiceType: AppointmentPracticeType | null;
}

// The sub-type the Visit Type requires (checked against the known values, as
// the form is untrusted), with the other one dropped.
function subTypeOf(
  form: ManualBookingForm,
): SubType | "MissingConsultType" | "MissingPracticeType" {
  if (form.visitType === "Consultation") {
    const consultType = CONSULT_TYPES.find((t) => t === form.consultType);
    return consultType
      ? { consultType, practiceType: null }
      : "MissingConsultType";
  }
  const practiceType = APPOINTMENT_PRACTICE_TYPES.find(
    (t) => t === form.practiceType,
  );
  return practiceType
    ? { consultType: null, practiceType }
    : "MissingPracticeType";
}

export type ManualBookingResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; rejection: ManualBookingRejection };

export interface ManualBookingDependencies {
  repository: Pick<AppointmentRepository, "create" | "scheduledIntervalsOn">;
  acceptedHealthInsurances: HealthInsurance[];
  /** Each Self-Pay variant's Coverage Instructions, copied on as online. */
  selfPayInstructions: Record<SelfPayVariant, string>;
  /** Send the WhatsApp Confirmation (called best-effort). */
  notifyConfirmation: (appointment: Appointment) => Promise<void> | void;
  /** Send the Confirmation email (called best-effort). */
  sendConfirmationEmail: (appointment: Appointment) => Promise<void> | void;
  generateId?: () => string;
  now?: () => Date;
}

/**
 * Manual Booking — the Professional entering an Appointment by hand, from the
 * Agendar turno tab. A sibling of online Booking with its own, smaller set of
 * guards: it ignores the Booking Window, the Work Schedule, the
 * open-Appointments-per-phone cap and the Deposit, but never lets the new
 * Appointment overlap a Scheduled one. The result is an ordinary Scheduled
 * Appointment flagged `origin: "manual"`, so it shows in Turnos and Calendario
 * and online Time Slots step around it.
 */
export async function bookManually(
  form: ManualBookingForm,
  deps: ManualBookingDependencies,
): Promise<ManualBookingResult> {
  const patientFirstName = (form.patientFirstName ?? "").trim();
  const patientLastName = (form.patientLastName ?? "").trim();
  if (patientFirstName === "" || patientLastName === "") {
    return { ok: false, rejection: "MissingName" };
  }

  const patientPhone = normalizeArgentinePhone(form.patientPhone);
  if (patientPhone === null) {
    return { ok: false, rejection: "InvalidPhone" };
  }

  const subType = subTypeOf(form);
  if (typeof subType === "string") {
    return { ok: false, rejection: subType };
  }

  if (!isISODate(form.date)) {
    return { ok: false, rejection: "InvalidDate" };
  }
  if (!TIME.test(form.time)) {
    return { ok: false, rejection: "InvalidTime" };
  }
  if (!DURATION_OPTIONS.includes(form.durationMinutes)) {
    return { ok: false, rejection: "InvalidDuration" };
  }
  const start = toMinutes(form.time);
  if (start + form.durationMinutes > MINUTES_PER_DAY) {
    return { ok: false, rejection: "OverrunsMidnight" };
  }

  const coverage: Coverage =
    form.coverage?.kind === "other"
      ? { kind: "other", name: sanitizeOtherCoverageName(form.coverage.name) }
      : form.coverage;
  if (
    !coverage ||
    !isCoverageValidForManualBooking(
      coverage,
      form.visitType,
      deps.acceptedHealthInsurances,
    )
  ) {
    return { ok: false, rejection: "InvalidCoverage" };
  }

  // One Professional, one agenda: never overlap a Scheduled Appointment, of
  // any origin. Touching (one ends as the next starts) is fine.
  const end = start + form.durationMinutes;
  const booked = await deps.repository.scheduledIntervalsOn(form.date);
  const overlaps = booked.some((interval) => {
    const bookedStart = toMinutes(interval.time);
    return start < bookedStart + interval.durationMinutes && bookedStart < end;
  });
  if (overlaps) {
    return { ok: false, rejection: "SlotTaken" };
  }

  const generateId = deps.generateId ?? randomUUID;
  const now = (deps.now ?? (() => new Date()))();

  const appointment: Appointment = {
    id: generateId(),
    origin: "manual",
    patientFirstName,
    patientLastName,
    patientPhone,
    patientEmail: null,
    visitType: form.visitType,
    consultType: subType.consultType,
    practiceType: subType.practiceType,
    coverage,
    coverageInstructions: coverageInstructionsFor(
      coverage,
      deps.acceptedHealthInsurances,
      deps.selfPayInstructions,
    ),
    deposit: null,
    date: form.date,
    time: form.time,
    durationMinutes: form.durationMinutes,
    status: "scheduled",
    whatsappConsentAt: form.whatsappConsent ? now.toISOString() : null,
    whatsappSent: false,
    whatsappSentAt: null,
    whatsappMessageId: null,
    emailSent: false,
    emailSentAt: null,
    emailMessageId: null,
    createdAt: now.toISOString(),
  };

  const created = await deps.repository.create(appointment);

  // A Confirmation goes out only with the Patient's consent, and only before
  // the visit. Best-effort: a failure never costs the Professional the entry.
  if (form.whatsappConsent && startsAfter(created, now)) {
    try {
      await deps.notifyConfirmation(created);
    } catch {
      // swallowed on purpose
    }
    try {
      await deps.sendConfirmationEmail(created);
    } catch {
      // swallowed on purpose
    }
  }

  return { ok: true, appointment: created };
}

// Whether the Appointment's start, on the Argentine wall clock (UTC−3, no
// DST), is still ahead of `now`.
function startsAfter(appointment: Appointment, now: Date): boolean {
  const start = new Date(`${appointment.date}T${appointment.time}:00-03:00`);
  return start.getTime() > now.getTime();
}
