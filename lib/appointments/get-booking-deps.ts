import { classifyBookingDateTime } from "../availability/availability";
import { getAvailabilityDeps } from "../availability/get-availability-deps";
import { getHealthInsuranceRepository } from "../coverage/get-health-insurance-repository";
import { getSelfPayPricingRepository } from "../deposit/get-self-pay-pricing-repository";
import { getPublicBaseUrl } from "../notifications/base-url";
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
  const repository = await getAppointmentRepository();
  const availabilityDeps = await getAvailabilityDeps();
  const outbox = await getNotificationOutbox();
  const sender = new FakeNotificationSender();
  const now = new Date();

  return {
    repository,
    acceptedHealthInsurances: await (
      await getHealthInsuranceRepository()
    ).list(),
    selfPayPricing: await (await getSelfPayPricingRepository()).get(),
    classifyDateTime: (date, time) =>
      classifyBookingDateTime(date, time, availabilityDeps),
    hasOpenAppointmentForPhone: async (phone) =>
      phoneHasOpenAppointment(
        await repository.findScheduledByPhone(phone),
        now,
      ),
    notifyConfirmation: (appointment) =>
      notifyConfirmation(appointment, {
        outbox,
        sender,
        appointments: repository,
        baseUrl: getPublicBaseUrl(),
      }),
  };
}
