import { DEFAULT_DURATION_MINUTES } from "@/lib/appointments/appointment";
import type { ManualBookingForm } from "@/lib/appointments/manual-booking";
import { parseVisitKind } from "@/lib/appointments/visit-kind";
import {
  APPOINTMENT_PRACTICE_TYPE_LABELS,
  APPOINTMENT_PRACTICE_TYPES,
  CONSULT_TYPE_LABELS,
  CONSULT_TYPES,
  type AppointmentPracticeType,
  type ConsultType,
  type VisitType,
} from "@/lib/appointments/visit-type";
import type { VisitDurations } from "@/lib/availability/visit-durations";
import type { Coverage, SelfPayVariant } from "@/lib/coverage/coverage";

/**
 * The Agendar turno form's state, as pure transitions so the rules — the
 * duration following the kind until edited, a Visit Type change clearing what
 * depends on it — are tested without React.
 */
export interface ManualFields {
  firstName: string;
  lastName: string;
  phone: string;
  visitType: VisitType | "";
  /** The Consult Type or Practice Type, depending on the Visit Type. */
  subType: ConsultType | AppointmentPracticeType | "";
  /** A coverage option's value, or OTHER_COVERAGE. */
  coverage: string;
  otherCoverageName: string;
  date: string;
  /** 24-hour clock: "00"–"23", or "" until chosen. */
  hour: string;
  /** "00"–"55", in steps of 5. */
  minute: string;
  durationMinutes: number;
  /** Whether the Professional picked the duration by hand. */
  durationEdited: boolean;
  whatsappConsent: boolean;
}

/** The coverage select's value for "Otro". */
export const OTHER_COVERAGE = "other";

export const EMPTY_FIELDS: ManualFields = {
  firstName: "",
  lastName: "",
  phone: "",
  visitType: "",
  subType: "",
  coverage: "",
  otherCoverageName: "",
  date: "",
  hour: "",
  minute: "00",
  durationMinutes: DEFAULT_DURATION_MINUTES,
  durationEdited: false,
  whatsappConsent: true,
};

const twoDigits = (n: number) => String(n).padStart(2, "0");

/**
 * The time is picked as hour + minute selects rather than a native time
 * input, whose 12- or 24-hour display follows the browser's locale and can't
 * be forced. These are always 24-hour.
 */
export const HOUR_OPTIONS: string[] = Array.from({ length: 24 }, (_, h) =>
  twoDigits(h),
);
/** Every 5 minutes: "00", "05", … "55". */
export const MINUTE_OPTIONS: string[] = Array.from({ length: 12 }, (_, i) =>
  twoDigits(i * 5),
);

export interface Option<T extends string> {
  value: T;
  label: string;
}

export function consultTypeOptions(): Option<ConsultType>[] {
  return CONSULT_TYPES.map((value) => ({
    value,
    label: CONSULT_TYPE_LABELS[value],
  }));
}

/** Every Practice Type, Plasma included — this form is the Professional's. */
export function practiceTypeOptions(): Option<AppointmentPracticeType>[] {
  return APPOINTMENT_PRACTICE_TYPES.map((value) => ({
    value,
    label: APPOINTMENT_PRACTICE_TYPE_LABELS[value],
  }));
}

// A Visit Kind's duration; Plasma (not a Visit Kind) and no choice yet take
// the default.
function defaultDuration(
  subType: ManualFields["subType"],
  durations: VisitDurations,
): number {
  const kind = parseVisitKind(subType);
  return kind ? durations[kind] : DEFAULT_DURATION_MINUTES;
}

function followDuration(
  fields: ManualFields,
  durations: VisitDurations,
): ManualFields {
  return fields.durationEdited
    ? fields
    : { ...fields, durationMinutes: defaultDuration(fields.subType, durations) };
}

/** Changing the Visit Type clears its sub-type and coverage. */
export function withVisitType(
  fields: ManualFields,
  visitType: ManualFields["visitType"],
  durations: VisitDurations,
): ManualFields {
  return followDuration(
    {
      ...fields,
      visitType,
      subType: "",
      coverage: "",
      otherCoverageName: "",
    },
    durations,
  );
}

export function withSubType(
  fields: ManualFields,
  subType: ManualFields["subType"],
  durations: VisitDurations,
): ManualFields {
  return followDuration({ ...fields, subType }, durations);
}

export function withDuration(
  fields: ManualFields,
  durationMinutes: number,
): ManualFields {
  return { ...fields, durationMinutes, durationEdited: true };
}

function coverageOf(fields: ManualFields): Coverage | null {
  if (fields.coverage === OTHER_COVERAGE) {
    return { kind: "other", name: fields.otherCoverageName };
  }
  const [kind, ...rest] = fields.coverage.split(":");
  const name = rest.join(":");
  if (kind === "self-pay" && name) {
    return { kind: "self-pay", variant: name as SelfPayVariant };
  }
  if (kind === "health-insurance" && name) {
    return { kind: "health-insurance", name };
  }
  return null;
}

/**
 * What the server action receives, or null while a select is still empty.
 * Everything else (names, phone, date, time) is validated server-side by
 * Manual Booking.
 */
export function toManualBookingForm(
  fields: ManualFields,
): ManualBookingForm | null {
  const coverage = coverageOf(fields);
  if (!fields.visitType || !fields.subType || !coverage) {
    return null;
  }
  const isConsultation = fields.visitType === "Consultation";
  return {
    patientFirstName: fields.firstName,
    patientLastName: fields.lastName,
    patientPhone: fields.phone,
    visitType: fields.visitType,
    consultType: isConsultation ? (fields.subType as ConsultType) : null,
    practiceType: isConsultation
      ? null
      : (fields.subType as AppointmentPracticeType),
    coverage,
    date: fields.date,
    // Blank without an hour, which Manual Booking refuses as InvalidTime.
    time: fields.hour ? `${fields.hour}:${fields.minute}` : "",
    durationMinutes: fields.durationMinutes,
    whatsappConsent: fields.whatsappConsent,
  };
}
