import type { Appointment, AppointmentStatus } from "./appointment";
import type {
  AppointmentQuery,
  AppointmentRepository,
} from "./appointment-repository";
import { statusOf, type DerivedStatus } from "./status";
import type { VisitType } from "./visit-type";

/**
 * The Appointment listing module — the dashboard's read seam, crossed by the
 * Appointments list (slice 10) and the calendar (slice 11).
 *
 * It owns the "derive Status, then filter" rule in one place. Because Completed
 * is derived from `now` (never stored), a Status filter cannot be a pure
 * database query: the module translates the *derived* Status filter into a
 * *persisted* query (cancelled→cancelled; scheduled/completed→scheduled; plus
 * the date range and Visit Type), lets the repository push that to the database,
 * then attaches each Appointment's derived Status and applies the final
 * scheduled-vs-completed partition in memory. The date-threshold rule stays in
 * `statusOf`; it never leaks into a persistence adapter.
 */
export interface AppointmentFilter {
  /** Inclusive lower bound on the Appointment date, "YYYY-MM-DD". */
  from?: string;
  /** Inclusive upper bound on the Appointment date, "YYYY-MM-DD". */
  to?: string;
  /** Derived Status: scheduled | cancelled | completed. */
  status?: DerivedStatus;
  visitType?: VisitType;
}

/** An Appointment paired with its derived Status, ready for display. */
export interface AppointmentView {
  appointment: Appointment;
  status: DerivedStatus;
}

export interface ListingDependencies {
  repository: Pick<AppointmentRepository, "findAppointments">;
  now?: () => Date;
}

/**
 * The persisted status to query for a given derived-Status filter. Scheduled and
 * Completed both live in persisted `scheduled` rows (Completed is the past ones);
 * an absent filter means "any persisted status".
 */
function persistedStatusFor(
  status: DerivedStatus | undefined,
): AppointmentStatus | undefined {
  if (status === "cancelled") return "cancelled";
  if (status === "scheduled" || status === "completed") return "scheduled";
  return undefined;
}

export async function listAppointments(
  filter: AppointmentFilter,
  deps: ListingDependencies,
): Promise<AppointmentView[]> {
  const now = (deps.now ?? (() => new Date()))();

  const query: AppointmentQuery = {
    from: filter.from,
    to: filter.to,
    status: persistedStatusFor(filter.status),
    visitType: filter.visitType,
  };
  const appointments = await deps.repository.findAppointments(query);

  const views = appointments.map((appointment) => ({
    appointment,
    status: statusOf(appointment, now),
  }));

  // scheduled vs. completed is derived, so it is the one part of the Status
  // filter that cannot be a persisted query — apply it here.
  return filter.status === undefined
    ? views
    : views.filter((view) => view.status === filter.status);
}
