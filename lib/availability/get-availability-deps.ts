import { getAppointmentRepository } from "../appointments/get-appointment-repository";
import type { AvailabilityDependencies } from "./availability";
import { getBookingWindowLengthRepository } from "./get-booking-window-length-repository";
import { getUnavailableDaysRepository } from "./get-unavailable-days-repository";
import { getVisitDurationsRepository } from "./get-visit-durations-repository";
import { getWorkScheduleRepository } from "./get-work-schedule-repository";

/**
 * Production wiring for Availability: the persisted Work Schedule (slice 13) and
 * Unavailable Days (slice 14) — both seeded/empty until the Professional edits
 * them — plus booked-interval reads through the repository seam. The single place
 * the running app composes Availability's dependencies, so Work Schedule,
 * Unavailable Day, and Booking Window length edits flow straight into the
 * Booking Window and Time Slots.
 */
export async function getAvailabilityDeps(): Promise<AvailabilityDependencies> {
  // The repository seams and the reads below are independent, so each group
  // runs in parallel — two round trips' worth of latency, not seven.
  const [
    repository,
    scheduleRepository,
    unavailableDaysRepository,
    visitDurationsRepository,
    bookingWindowLengthRepository,
  ] = await Promise.all([
    getAppointmentRepository(),
    getWorkScheduleRepository(),
    getUnavailableDaysRepository(),
    getVisitDurationsRepository(),
    getBookingWindowLengthRepository(),
  ]);
  const [workSchedule, unavailableDays, visitDurations, bookingWindowDays] =
    await Promise.all([
      scheduleRepository.get(),
      unavailableDaysRepository.list(),
      visitDurationsRepository.get(),
      bookingWindowLengthRepository.get(),
    ]);
  return {
    workSchedule,
    unavailableDays,
    visitDurations,
    bookingWindowDays,
    scheduledIntervalsOn: (date) => repository.scheduledIntervalsOn(date),
    scheduledIntervalsBetween: (from, to) =>
      repository.scheduledIntervalsBetween(from, to),
  };
}
