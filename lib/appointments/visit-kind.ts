import {
  CONSULT_TYPE_LABELS,
  CONSULT_TYPES,
  PRACTICE_TYPE_LABELS,
  PRACTICE_TYPES,
  VISIT_TYPE_LABELS,
  type ConsultType,
  type PracticeType,
  type VisitType,
} from "./visit-type";

/**
 * The Visit Kind (CONTEXT.md) — what is actually being booked: a Visit Type
 * together with its required sub-type. The unit availability is set for.
 *
 * Consult Types and Practice Types never share a name, so the sub-type alone
 * identifies the kind; that keeps it a plain string, safe in a URL.
 */
export type VisitKind = ConsultType | PracticeType;

export const VISIT_KINDS: VisitKind[] = [...CONSULT_TYPES, ...PRACTICE_TYPES];

/** The kinds grouped under their Visit Type, in display order. */
export const VISIT_KIND_GROUPS: { visitType: VisitType; kinds: VisitKind[] }[] =
  [
    { visitType: "Consultation", kinds: CONSULT_TYPES },
    { visitType: "Practice", kinds: PRACTICE_TYPES },
  ];

/** Spanish label: "<Tipo de visita> · <sub-type>". */
export const VISIT_KIND_LABELS: Record<VisitKind, string> = {
  FirstVisit: `${VISIT_TYPE_LABELS.Consultation} · ${CONSULT_TYPE_LABELS.FirstVisit}`,
  FollowUp: `${VISIT_TYPE_LABELS.Consultation} · ${CONSULT_TYPE_LABELS.FollowUp}`,
  Cryosurgery: `${VISIT_TYPE_LABELS.Practice} · ${PRACTICE_TYPE_LABELS.Cryosurgery}`,
  Electrocoagulation: `${VISIT_TYPE_LABELS.Practice} · ${PRACTICE_TYPE_LABELS.Electrocoagulation}`,
  Biopsy: `${VISIT_TYPE_LABELS.Practice} · ${PRACTICE_TYPE_LABELS.Biopsy}`,
};

/**
 * The Visit Kind of an Appointment or Booking Form: the sub-type that belongs
 * to its Visit Type, or null while that sub-type is still missing.
 */
export function visitKindOf(visit: {
  visitType: VisitType;
  consultType?: ConsultType | null;
  practiceType?: PracticeType | null;
}): VisitKind | null {
  return visit.visitType === "Consultation"
    ? (visit.consultType ?? null)
    : (visit.practiceType ?? null);
}

/** Read a Visit Kind from untrusted input (a URL parameter), or null. */
export function parseVisitKind(value: string | null | undefined): VisitKind | null {
  return VISIT_KINDS.find((kind) => kind === value) ?? null;
}
