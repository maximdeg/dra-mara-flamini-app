import type { AppointmentFilter } from "./appointment-listing";
import type { DerivedStatus } from "./status";
import { VISIT_TYPES, type VisitType } from "./visit-type";

/** The derived Statuses the Turnos filter offers, in display order. */
export const DERIVED_STATUSES: DerivedStatus[] = [
  "scheduled",
  "cancelled",
  "completed",
];

/** URL search params as Next.js hands them to a page. */
export type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.length > 0 ? v : undefined;
}

/**
 * The Turnos tab's filter, read from its URL. Empty values mean "no limit",
 * and unknown Status or Visit Type values are dropped.
 */
export function filterFromSearchParams(params: SearchParams): AppointmentFilter {
  const status = one(params.status);
  const visitType = one(params.visitType);
  return {
    from: one(params.from),
    to: one(params.to),
    status: DERIVED_STATUSES.includes(status as DerivedStatus)
      ? (status as DerivedStatus)
      : undefined,
    visitType: VISIT_TYPES.includes(visitType as VisitType)
      ? (visitType as VisitType)
      : undefined,
  };
}
