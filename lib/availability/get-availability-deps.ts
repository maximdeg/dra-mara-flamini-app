import { getAppointmentRepository } from "../appointments/get-appointment-repository";
import type { AvailabilityDependencies } from "./availability";
import { getUnavailableDaysRepository } from "./get-unavailable-days-repository";
import { getWorkScheduleRepository } from "./get-work-schedule-repository";

/**
 * Production wiring for Availability: the persisted Work Schedule (slice 13) and
 * Unavailable Days (slice 14) — both seeded/empty until the Professional edits
 * them — plus booked-times reads through the repository seam. The single place
 * the running app composes Availability's dependencies, so Work Schedule and
 * Unavailable Day edits flow straight into the Booking Window and Time Slots.
 */
export async function getAvailabilityDeps(): Promise<AvailabilityDependencies> {
  const repository = await getAppointmentRepository();
  const scheduleRepository = await getWorkScheduleRepository();
  const unavailableDaysRepository = await getUnavailableDaysRepository();
  return {
    workSchedule: await scheduleRepository.get(),
    unavailableDays: await unavailableDaysRepository.list(),
    scheduledTimesOn: (date) => repository.scheduledTimesOn(date),
  };
}
