import { classifyBookingDateTime } from "../availability/availability";
import { getAvailabilityDeps } from "../availability/get-availability-deps";
import { getHealthInsuranceRepository } from "../coverage/get-health-insurance-repository";
import { getSelfPayPricingRepository } from "../deposit/get-self-pay-pricing-repository";
import { getEmailSender } from "../notifications/email/get-email-sender";
import { sendConfirmationEmail } from "../notifications/email/send-confirmation-email";
import { getWhatsAppSender } from "../notifications/whatsapp/get-whatsapp-sender";
import { sendConfirmationWhatsApp } from "../notifications/whatsapp/send-confirmation-whatsapp";
import type { BookingDependencies } from "./booking";
import { getAppointmentRepository } from "./get-appointment-repository";
import { isAtOpenAppointmentLimit } from "./phone-limit";

/**
 * Production composition root for Booking. It wires the seeded coverage/pricing
 * config and composes the two external checks — date/time classification (from
 * Availability) and the open-Appointments-per-phone cap (from the
 * repository + today's date) — so the route handler stays a thin adapter and
 * Booking itself never creates its own dependencies.
 */
export async function getBookingDeps(): Promise<BookingDependencies> {
  // These five composition steps are independent, so they run in parallel
  // instead of serially — the booking POST waits on the slowest, not the sum.
  const [repository, availabilityDeps, acceptedHealthInsurances, selfPayPricing] =
    await Promise.all([
      getAppointmentRepository(),
      getAvailabilityDeps(),
      getHealthInsuranceRepository().then((r) => r.list()),
      getSelfPayPricingRepository().then((r) => r.get()),
    ]);
  const now = new Date();

  return {
    repository,
    acceptedHealthInsurances,
    selfPayPricing,
    classifyDateTime: (date, time) =>
      classifyBookingDateTime(date, time, availabilityDeps),
    isPhoneAtOpenAppointmentLimit: async (phone) =>
      isAtOpenAppointmentLimit(
        await repository.findScheduledByPhone(phone),
        now,
      ),
    // The WhatsApp sender is built lazily here so missing Meta config throws
    // inside book()'s best-effort catch rather than failing deps composition —
    // the Confirmation goes out via the Meta Cloud API template (ADR-0003).
    notifyConfirmation: (appointment) =>
      sendConfirmationWhatsApp(appointment, {
        sender: getWhatsAppSender(),
        appointments: repository,
      }),
    // The email sender is built lazily here so missing Gmail config throws
    // inside book()'s best-effort catch rather than failing deps composition.
    sendConfirmationEmail: (appointment) =>
      sendConfirmationEmail(appointment, {
        sender: getEmailSender(),
        appointments: repository,
      }),
  };
}
