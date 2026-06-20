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
