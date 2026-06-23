import { classifyBookingDateTime } from "../availability/availability";
import { getAvailabilityDeps } from "../availability/get-availability-deps";
import { getHealthInsuranceRepository } from "../coverage/get-health-insurance-repository";
import { getSelfPayPricingRepository } from "../deposit/get-self-pay-pricing-repository";
import { getNotificationOutbox } from "../notifications/get-notification-outbox";
import { notifyConfirmation } from "../notifications/notify-confirmation";
import { FakeNotificationSender } from "../notifications/sender";
import { phoneHasOpenAppointment, type BookingDependencies } from "./booking";
import { getAppointmentRepository } from "./get-appointment-repository";

/**
 * Production composition root for Booking. It wires the seeded coverage/pricing
 * config and composes the two external checks — date/time classification (from
 * Availability) and the one-open-Appointment-per-phone rule (from the
 * repository + today's date) — so the route handler stays a thin adapter and
 * Booking itself never creates its own dependencies.
 */
export async function getBookingDeps(): Promise<BookingDependencies> {
  // These five composition steps are independent, so they run in parallel
  // instead of serially — the booking POST waits on the slowest, not the sum.
  const [
    repository,
    availabilityDeps,
    outbox,
    acceptedHealthInsurances,
    selfPayPricing,
  ] = await Promise.all([
    getAppointmentRepository(),
    getAvailabilityDeps(),
    getNotificationOutbox(),
    getHealthInsuranceRepository().then((r) => r.list()),
    getSelfPayPricingRepository().then((r) => r.get()),
  ]);
  const sender = new FakeNotificationSender();
  const now = new Date();

  return {
    repository,
    acceptedHealthInsurances,
    selfPayPricing,
    classifyDateTime: (date, time) =>
      classifyBookingDateTime(date, time, availabilityDeps),
    hasOpenAppointmentForPhone: async (phone) =>
      phoneHasOpenAppointment(
        await repository.findScheduledByPhone(phone),
        now,
      ),
    notifyConfirmation: (appointment) =>
      notifyConfirmation(appointment, { outbox, sender, appointments: repository }),
  };
}
