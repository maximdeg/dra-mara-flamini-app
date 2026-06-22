import { getPublicBaseUrl } from "../notifications/base-url";
import { getNotificationOutbox } from "../notifications/get-notification-outbox";
import { notifyCancellation } from "../notifications/notify-cancellation";
import { FakeNotificationSender } from "../notifications/sender";
import type { CancellationDependencies } from "./cancellation";
import { getAppointmentRepository } from "./get-appointment-repository";

/**
 * Production composition root for Cancellation: the repository plus a
 * Cancellation Notice composed from the outbox + (fake) sender.
 */
export async function getCancellationDeps(): Promise<CancellationDependencies> {
  const repository = await getAppointmentRepository();
  const outbox = await getNotificationOutbox();
  const sender = new FakeNotificationSender();

  return {
    repository,
    notifyCancellation: (appointment) =>
      notifyCancellation(appointment, {
        outbox,
        sender,
        baseUrl: getPublicBaseUrl(),
      }),
  };
}
