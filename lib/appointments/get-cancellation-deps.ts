import { getPublicBaseUrl } from "../notifications/base-url";
import { getNotificationOutbox } from "../notifications/get-notification-outbox";
import { notifyCancellation } from "../notifications/notify-cancellation";
import type { CancellationDependencies } from "./cancellation";
import { getAppointmentRepository } from "./get-appointment-repository";

/**
 * Production composition root for Cancellation: the repository plus a
 * Cancellation Notice enqueued to the outbox (the worker delivers it).
 */
export async function getCancellationDeps(): Promise<CancellationDependencies> {
  const repository = await getAppointmentRepository();
  const outbox = await getNotificationOutbox();

  return {
    repository,
    notifyCancellation: (appointment) =>
      notifyCancellation(appointment, { outbox, baseUrl: getPublicBaseUrl() }),
  };
}
