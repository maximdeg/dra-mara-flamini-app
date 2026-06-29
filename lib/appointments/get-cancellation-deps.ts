import { getClinicInfoRepository } from "../clinic/get-clinic-info-repository";
import { getEmailSender } from "../notifications/email/get-email-sender";
import { sendCancellationEmail } from "../notifications/email/send-cancellation-email";
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
      notifyCancellation(appointment, { outbox, sender }),
    // Built lazily so missing Gmail config (or a clinic-info read) throws inside
    // cancel()'s best-effort catch rather than failing deps composition.
    sendCancellationEmail: async (appointment, actor) => {
      const { contact } = await getClinicInfoRepository().then((r) => r.get());
      await sendCancellationEmail(appointment, actor, {
        sender: getEmailSender(),
        contacts: contact.contacts,
      });
    },
  };
}
