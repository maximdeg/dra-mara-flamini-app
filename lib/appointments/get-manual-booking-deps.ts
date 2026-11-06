import { getHealthInsuranceRepository } from "../coverage/get-health-insurance-repository";
import { getSelfPayPricingRepository } from "../deposit/get-self-pay-pricing-repository";
import { confirmationNotifiers } from "./get-booking-deps";
import { getAppointmentRepository } from "./get-appointment-repository";
import type { ManualBookingDependencies } from "./manual-booking";

/**
 * Production composition root for Manual Booking: the repository, the
 * accepted Health Insurances and Self-Pay Instructions (to validate the
 * coverage and copy its Instructions), and the same Confirmation channels as
 * online Booking.
 */
export async function getManualBookingDeps(): Promise<ManualBookingDependencies> {
  const [repository, acceptedHealthInsurances, selfPayPricing] =
    await Promise.all([
      getAppointmentRepository(),
      getHealthInsuranceRepository().then((r) => r.list()),
      getSelfPayPricingRepository().then((r) => r.get()),
    ]);

  return {
    repository,
    acceptedHealthInsurances,
    selfPayInstructions: selfPayPricing.instructions,
    ...confirmationNotifiers(repository),
  };
}
