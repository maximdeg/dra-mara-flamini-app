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

/** The URL keys the Turnos filter form submits. */
export const FILTER_KEYS = ["status", "visitType", "from", "to"] as const;

/**
 * The Turnos tab's filter, read from its URL.
 *
 * A fresh visit (none of the filter keys in the URL) opens on `today`, in
 * every Status and Visit Type. Submitting the form always sends every key,
 * even empty ones, so once any key is present the values are honored as
 * given: empty means "no limit", and unknown Status or Visit Type values are
 * dropped.
 */
export function filterFromSearchParams(
  params: SearchParams,
  today: string,
): AppointmentFilter {
  if (!FILTER_KEYS.some((key) => key in params)) {
    return { from: today, to: today, status: undefined, visitType: undefined };
  }
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

/**
 * The query string for "Ver todos": every filter key present and empty, which
 * a submitted form reads as "no limits".
 */
export const SHOW_ALL_QUERY = FILTER_KEYS.map((key) => `${key}=`).join("&");
