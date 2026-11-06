/**
 * Visit Type and its required sub-types (CONTEXT.md).
 *
 * What an Appointment is for: a Consultation (which requires a Consult Type) or
 * a Practice (which requires a Practice Type). Canonical terms are English; the
 * Spanish UI labels live in the *_LABELS maps below.
 */
export type VisitType = "Consultation" | "Practice";
export type ConsultType = "FirstVisit" | "FollowUp";
export type PracticeType = "Cryosurgery" | "Electrocoagulation" | "Biopsy";

export const VISIT_TYPES: VisitType[] = ["Consultation", "Practice"];
export const CONSULT_TYPES: ConsultType[] = ["FirstVisit", "FollowUp"];
export const PRACTICE_TYPES: PracticeType[] = [
  "Cryosurgery",
  "Electrocoagulation",
  "Biopsy",
];

export const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  Consultation: "Consulta",
  Practice: "Práctica",
};

export const CONSULT_TYPE_LABELS: Record<ConsultType, string> = {
  FirstVisit: "Primera vez",
  FollowUp: "Seguimiento",
};

export const PRACTICE_TYPE_LABELS: Record<PracticeType, string> = {
  Cryosurgery: "Criocirugía",
  Electrocoagulation: "Electrocoagulación",
  Biopsy: "Biopsia",
};

/**
 * Practice Types only the Professional can enter, from the manual scheduler.
 * They are not Visit Kinds: no Work Schedule range, Visit Duration or online
 * booking ever offers them.
 */
export type AdminPracticeType =
  | "Plasma"
  | "Peeling"
  | "SkinBooster"
  | "BotulinumToxin";
export const ADMIN_PRACTICE_TYPES: AdminPracticeType[] = [
  "Plasma",
  "Peeling",
  "SkinBooster",
  "BotulinumToxin",
];

/**
 * Every Practice Type an Appointment may hold — the bookable ones and the
 * admin-only ones.
 */
export type AppointmentPracticeType = PracticeType | AdminPracticeType;
export const APPOINTMENT_PRACTICE_TYPES: AppointmentPracticeType[] = [
  ...PRACTICE_TYPES,
  ...ADMIN_PRACTICE_TYPES,
];

export const APPOINTMENT_PRACTICE_TYPE_LABELS: Record<
  AppointmentPracticeType,
  string
> = {
  ...PRACTICE_TYPE_LABELS,
  Plasma: "Plasma",
  Peeling: "Peeling",
  SkinBooster: "Skin Booster",
  BotulinumToxin: "Toxina Botulínica",
};
